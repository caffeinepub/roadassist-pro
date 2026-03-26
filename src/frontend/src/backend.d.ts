import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    lat: number;
    lng: number;
}
export interface UserProfile {
    name: string;
    role: Role;
    email: string;
    phone: string;
}
export type Rating = bigint;
export interface NewRating {
    requestId: Id;
    score: Rating;
    comment: string;
    providerId: Id;
}
export interface AssistanceRequest {
    id: Id;
    status: RequestStatus;
    userId: Principal;
    description: string;
    userLocation: Location;
    assignedProviderId?: Id;
    requestType: ServiceType;
}
export interface RatingEntry {
    id: Id;
    requestId: Id;
    score: Rating;
    comment: string;
    providerId: Id;
}
export type Id = bigint;
export interface NewProviderProfile {
    lat: number;
    lng: number;
    serviceType: ServiceType;
}
export interface UpdateProviderProfile {
    lat?: number;
    lng?: number;
    serviceType?: ServiceType;
    isAvailable?: boolean;
}
export interface ProviderProfile {
    id: Id;
    isApproved: boolean;
    serviceType: ServiceType;
    ratingCount: bigint;
    userId: Principal;
    isAvailable: boolean;
    rating: number;
    location: Location;
}
export interface NewAssistanceRequest {
    lat: number;
    lng: number;
    description: string;
    requestType: ServiceType;
}
export enum RequestStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    accepted = "accepted",
    inProgress = "inProgress"
}
export enum Role {
    admin = "admin",
    provider = "provider",
    user = "user"
}
export enum ServiceType {
    fuel = "fuel",
    mechanic = "mechanic",
    towing = "towing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveProvider(id: Id): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAssistanceRequest(input: NewAssistanceRequest): Promise<Id>;
    createProviderProfile(input: NewProviderProfile): Promise<Id>;
    getAllProviders(): Promise<Array<ProviderProfile>>;
    getAllRatings(): Promise<Array<RatingEntry>>;
    getAllRequests(): Promise<Array<AssistanceRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProvider(id: Id): Promise<ProviderProfile>;
    getProviderRatings(providerId: Id): Promise<Array<RatingEntry>>;
    getRequest(requestId: Id): Promise<AssistanceRequest>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRating(input: NewRating): Promise<Id>;
    updateProviderProfile(id: Id, input: UpdateProviderProfile): Promise<void>;
    updateRequestStatus(requestId: Id, status: RequestStatus): Promise<void>;
}
