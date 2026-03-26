import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import List "mo:core/List";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type Id = Nat;
  type Rating = Nat;
  type RequestIndex = Nat;

  type Location = {
    lat : Float;
    lng : Float;
  };

  type ServiceType = {
    #fuel;
    #mechanic;
    #towing;
  };

  type RequestStatus = {
    #pending;
    #accepted;
    #inProgress;
    #completed;
    #cancelled;
  };

  type Role = {
    #user;
    #provider;
    #admin;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    role : Role;
  };

  type ProviderProfile = {
    id : Id;
    userId : Principal;
    serviceType : ServiceType;
    location : Location;
    isAvailable : Bool;
    isApproved : Bool;
    rating : Float;
    ratingCount : Nat;
  };

  type AssistanceRequest = {
    id : Id;
    userId : Principal;
    requestType : ServiceType;
    description : Text;
    status : RequestStatus;
    userLocation : Location;
    assignedProviderId : ?Id;
  };

  type RatingEntry = {
    id : Id;
    requestId : Id;
    providerId : Id;
    score : Rating;
    comment : Text;
  };

  module ProviderProfile {
    public func compare(p1 : ProviderProfile, p2 : ProviderProfile) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  module AssistanceRequest {
    public func compare(r1 : AssistanceRequest, r2 : AssistanceRequest) : Order.Order {
      Nat.compare(r1.id, r2.id);
    };
  };

  module RatingEntry {
    public func compare(e : RatingEntry, other : RatingEntry) : Order.Order {
      Nat.compare(e.id, other.id);
    };
  };

  // CRUD types
  type NewProviderProfile = {
    serviceType : ServiceType;
    lat : Float;
    lng : Float;
  };

  type UpdateProviderProfile = {
    serviceType : ?ServiceType;
    lat : ?Float;
    lng : ?Float;
    isAvailable : ?Bool;
  };

  type NewAssistanceRequest = {
    requestType : ServiceType;
    description : Text;
    lat : Float;
    lng : Float;
  };

  type NewRating = {
    requestId : Id;
    providerId : Id;
    score : Rating;
    comment : Text;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let providers = Map.empty<Id, ProviderProfile>();
  let requests = Map.empty<Id, AssistanceRequest>();
  let ratings = Map.empty<Id, RatingEntry>();

  var providerIdCounter = 0;
  var requestIdCounter = 0;
  var ratingIdCounter = 0;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if caller is a provider
  func isProvider(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#provider) { true };
          case (_) { false };
        };
      };
    };
  };

  // Helper function to get provider ID for a user
  func getProviderIdForUser(userId : Principal) : ?Id {
    for ((id, provider) in providers.entries()) {
      if (provider.userId == userId) {
        return ?id;
      };
    };
    null;
  };

  // Provider logic
  public shared ({ caller }) func createProviderProfile(input : NewProviderProfile) : async Id {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create provider profiles");
    };

    let id = providerIdCounter;
    providerIdCounter += 1;

    let profile : ProviderProfile = {
      id;
      userId = caller;
      serviceType = input.serviceType;
      location = {
        lat = input.lat;
        lng = input.lng;
      };
      isAvailable = true;
      isApproved = false;
      rating = 0;
      ratingCount = 0;
    };

    providers.add(id, profile);
    id;
  };

  public shared ({ caller }) func updateProviderProfile(id : Id, input : UpdateProviderProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update provider profiles");
    };

    let existing = switch (providers.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?p) { p };
    };

    if (existing.userId != caller) {
      Runtime.trap("Unauthorized: Can only update your own provider profile");
    };

    let updated : ProviderProfile = {
      existing with
      serviceType = switch (input.serviceType) {
        case (null) { existing.serviceType };
        case (?newType) { newType };
      };
      location = {
        lat = switch (input.lat) {
          case (null) { existing.location.lat };
          case (?newLat) { newLat };
        };
        lng = switch (input.lng) {
          case (null) { existing.location.lng };
          case (?newLng) { newLng };
        };
      };
      isAvailable = switch (input.isAvailable) {
          case (null) { existing.isAvailable };
          case (?newAvailability) { newAvailability };
        };
    };

    providers.add(id, updated);
  };

  public shared ({ caller }) func approveProvider(id : Id) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve providers");
    };

    let existing = switch (providers.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?p) { p };
    };

    let updated : ProviderProfile = {
      existing with
      isApproved = true;
    };

    providers.add(id, updated);
  };

  public query ({ caller }) func getProvider(id : Id) : async ProviderProfile {
    // Public read access - no authorization needed
    switch (providers.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?p) { p };
    };
  };

  public query ({ caller }) func getAllProviders() : async [ProviderProfile] {
    // Public read access - no authorization needed
    providers.values().toArray().sort();
  };

  // Request logic
  public shared ({ caller }) func createAssistanceRequest(input : NewAssistanceRequest) : async Id {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create assistance requests");
    };

    let id = requestIdCounter;
    requestIdCounter += 1;

    let req : AssistanceRequest = {
      id;
      userId = caller;
      requestType = input.requestType;
      description = input.description;
      status = #pending;
      userLocation = { lat = input.lat; lng = input.lng };
      assignedProviderId = null;
    };

    requests.add(id, req);
    id;
  };

  public shared ({ caller }) func updateRequestStatus(requestId : Id, status : RequestStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update request status");
    };

    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    // Authorization: Only the requester, assigned provider, or admin can update status
    let isRequester = request.userId == caller;
    let isAssignedProvider = switch (request.assignedProviderId) {
      case (null) { false };
      case (?providerId) {
        switch (providers.get(providerId)) {
          case (null) { false };
          case (?provider) { provider.userId == caller };
        };
      };
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not (isRequester or isAssignedProvider or isAdmin)) {
      Runtime.trap("Unauthorized: Can only update your own requests or assigned requests");
    };

    let updatedRequest : AssistanceRequest = {
      request with
      status;
    };
    requests.add(requestId, updatedRequest);
  };

  public query ({ caller }) func getRequest(requestId : Id) : async AssistanceRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view requests");
    };

    let request = switch (requests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    // Authorization: Only the requester, assigned provider, or admin can view
    let isRequester = request.userId == caller;
    let isAssignedProvider = switch (request.assignedProviderId) {
      case (null) { false };
      case (?providerId) {
        switch (providers.get(providerId)) {
          case (null) { false };
          case (?provider) { provider.userId == caller };
        };
      };
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not (isRequester or isAssignedProvider or isAdmin)) {
      Runtime.trap("Unauthorized: Can only view your own requests or assigned requests");
    };

    request;
  };

  public query ({ caller }) func getAllRequests() : async [AssistanceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view requests");
    };

    // Admins see all requests
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return requests.values().toArray().sort();
    };

    // Get caller's provider ID if they are a provider
    let callerProviderId = getProviderIdForUser(caller);

    // Filter requests: users see their own, providers see assigned requests
    let filteredRequests = requests.values().toArray().filter(func(req : AssistanceRequest) : Bool {
      // User's own requests
      if (req.userId == caller) {
        return true;
      };
      // Provider's assigned requests
      switch (callerProviderId) {
        case (null) { false };
        case (?providerId) {
          switch (req.assignedProviderId) {
            case (null) { false };
            case (?assignedId) { assignedId == providerId };
          };
        };
      };
    });

    filteredRequests.sort();
  };

  // Rating logic
  public shared ({ caller }) func submitRating(input : NewRating) : async Id {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit ratings");
    };

    // Verify the request exists and belongs to the caller
    let request = switch (requests.get(input.requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?req) { req };
    };

    if (request.userId != caller) {
      Runtime.trap("Unauthorized: Can only rate requests you created");
    };

    // Verify the request is completed
    switch (request.status) {
      case (#completed) { /* OK */ };
      case (_) { Runtime.trap("Can only rate completed requests") };
    };

    // Verify the provider matches the assigned provider
    switch (request.assignedProviderId) {
      case (null) { Runtime.trap("Request has no assigned provider") };
      case (?assignedId) {
        if (assignedId != input.providerId) {
          Runtime.trap("Provider ID does not match assigned provider");
        };
      };
    };

    // Verify score is valid (1-5)
    if (input.score < 1 or input.score > 5) {
      Runtime.trap("Rating score must be between 1 and 5");
    };

    let ratingId = ratingIdCounter;
    ratingIdCounter += 1;

    let entry : RatingEntry = {
      id = ratingId;
      requestId = input.requestId;
      providerId = input.providerId;
      score = input.score;
      comment = input.comment;
    };

    ratings.add(ratingId, entry);
    updateProviderRating(input.providerId, input.score);

    ratingId;
  };

  func updateProviderRating(providerId : Id, score : Rating) {
    let existing = switch (providers.get(providerId)) {
      case (null) { return () };
      case (?p) { p };
    };

    let totalScore = existing.rating * existing.ratingCount.toFloat() + score.toFloat();
    let newRatingCount = existing.ratingCount + 1;
    let newAverage = totalScore / newRatingCount.toFloat();

    let updated : ProviderProfile = {
      existing with
      rating = newAverage;
      ratingCount = newRatingCount;
    };

    providers.add(providerId, updated);
  };

  public query ({ caller }) func getProviderRatings(providerId : Id) : async [RatingEntry] {
    // Public read access - no authorization needed
    ratings.values().toArray().filter(func(r) { r.providerId == providerId }).sort();
  };

  public query ({ caller }) func getAllRatings() : async [RatingEntry] {
    // Public read access - no authorization needed
    ratings.values().toArray().sort();
  };
};
