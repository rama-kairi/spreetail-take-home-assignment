# Frontend Setup

This frontend is built with modern React tooling and best practices.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - Type-safe routing with file-based routes
- **TanStack Query** - Server state management and data fetching
- **Ky** - HTTP client with retry and error handling
- **Zod** - Schema validation and type inference
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Biome** - Fast formatter and linter

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/            # Custom React hooks (TanStack Query)
│   ├── lib/              # Utilities and configurations
│   │   ├── api.ts        # Ky HTTP client setup
│   │   ├── query-client.ts # TanStack Query client
│   │   ├── schemas.ts    # Zod schemas
│   │   └── utils.ts      # Utility functions
│   ├── routes/            # TanStack Router file-based routes
│   │   ├── __root.tsx    # Root route layout
│   │   ├── index.tsx     # Home page (/)
│   │   └── about.tsx    # About page (/about)
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles (Tailwind)
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── components.json        # shadcn/ui configuration
```

## Key Features

### TanStack Router
- File-based routing (routes are automatically generated)
- Type-safe navigation with `Link` component
- Route params and search params validation
- Devtools for route inspection

### TanStack Query
- Automatic caching and refetching
- Optimistic updates
- Devtools for query inspection
- Built-in loading and error states

### Ky HTTP Client
- Configured with retry logic
- Error handling hooks
- Type-safe API calls with Zod validation
- Environment-based API URL

### Zod Schemas
- Runtime type validation
- Type inference for TypeScript
- API response validation
- Form validation ready

## Usage Examples

### Creating a Route

Create a new file in `src/routes/`:

```tsx
// src/routes/users.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

function UsersPage() {
  return <div>Users Page</div>;
}
```

### Using TanStack Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { api, fetchWithValidation } from "@/lib/api";
import { userSchema } from "@/lib/schemas";

function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      return fetchWithValidation(
        api.get(`users/${id}`).json(),
        userSchema
      );
    },
  });
}
```

### Using Mutations

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      return api.post("users", { json: data }).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### Navigation

```tsx
import { Link } from "@tanstack/react-router";

<Link to="/about">About</Link>
<Link to="/users/$userId" params={{ userId: "123" }}>
  User Profile
</Link>
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Lint code
bun run lint

# Format code
bun run format
```

## Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

Components will be added to `src/components/ui/`.

## Type Safety

- All routes are type-safe with TanStack Router
- API responses are validated with Zod
- TypeScript strict mode enabled
- Path aliases configured (`@/` for `src/`)
