

# EventSnap Backend

Minimal event photo platform backend (NestJS + Prisma + PostgreSQL + AWS S3).

## Setup

```bash
npm install
npx prisma migrate deploy
npm run start:dev
```

## Features
- JWT authentication
- Event & guest management
- Photo upload (S3), tagging, delete
- Public endpoints for guest registration & photo viewing
- Secure presigned S3 URLs

## Folder Structure
```
src/
	app.module.ts         # Main NestJS module
	events/               # Event endpoints & logic
	guests/               # Guest endpoints & logic
	photos/               # Photo endpoints & logic
	prisma/               # Prisma service
prisma/schema.prisma    # DB schema
```

## API
- `POST   /auth/login` — Login
- `GET    /events` — List events
- `POST   /events` — Create event
- `DELETE /events/:id` — Delete event
- `POST   /guests/event/:eventId` — Add guest
- `GET    /guests/event/:eventId` — List guests
- `POST   /photos/upload` — Upload photo
- `GET    /photos/event/:eventId` — Get photos
- `POST   /photos/:id/tag` — Tag guest in photo
- `DELETE /photos/:id` — Delete photo
- `GET    /photos/presigned/:key` — Get presigned S3 URL

## Notes
- Environment variables in `.env`
- JWT token required for photographer endpoints
- Public endpoints for guest registration & viewing

## Deployment
- Ready for AWS Elastic Beanstalk (Dockerfile included)
