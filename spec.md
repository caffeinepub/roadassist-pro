# RoadAssist Pro

## Current State
New project (no existing source files).

## Requested Changes (Diff)

### Add
- Full-stack On-Road Fuel and Breakdown Assistance System
- User authentication via Internet Identity with role-based access (vehicle owner, service provider, admin)
- Emergency assistance request system (fuel, mechanic, towing)
- Service provider management with admin approval workflow
- Request tracking with status updates (Pending → Accepted → In Progress → Completed)
- Rating & feedback system for completed requests
- Admin dashboard: approve providers, view all requests
- Dark mode UI
- Map view using OpenStreetMap/Leaflet showing providers and request locations
- Smart provider matching (rule-based: distance + rating)

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Select authorization and user-approval components
2. Generate Motoko backend with: user profiles, service requests, provider management, ratings, admin functions
3. Build React frontend with: dashboard, SOS request flow, map view, provider panel, admin dashboard, dark mode
