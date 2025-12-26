# Gateway (Nginx)

This folder will hold the Nginx configuration that fronts both services.

Responsibilities:
- Terminate TLS (if needed) and expose a unified endpoint for the clients.
- Route `/core/*` traffic to Service A (Core API / PostgreSQL).
- Route `/rt/*` traffic to Service B (Realtime / Firestore sync).
- Apply rate limiting / headers if necessary.

Planned files:
- `nginx.conf` – upstream definitions for core/realtime services.

Implementation will be added once the services are ready.



