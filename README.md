# Frontend Developer Guide

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd agms-frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory

```env
NEXT_PUBLIC_API_URL=https://your-railway-app-url.up.railway.app
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

## 🔧 Tech Stack

- **Framework**: Next.js
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel
- **API Integration**: REST API with Spring Boot backend

## 📁 Project Structure

```
src/
├── app/                 # Next.js 13+ app directory
├── components/          # Reusable React components
├── lib/                 # Utility functions and API clients
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Global styles and CSS modules
```

## 🔐 Authentication Flow

### Login/Register

1. User submits credentials on `/login` or `/register`
2. Frontend makes API call to backend
3. On success, JWT is stored in localStorage
4. User is redirected to dashboard

### Protected Routes

- Use the `useAuth` hook to check authentication status
- Redirect unauthenticated users to login
- Include JWT in API requests

### Logout

- Clear JWT from localStorage
- Redirect to login page

## 🌐 API Integration

### Making API Calls

```typescript
// Example API call with authentication
const fetchData = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/endpoint`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`
3. Deploy!

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (Railway)
- Add other environment variables as needed

## 🔒 Security Best Practices

1. Never store sensitive information in localStorage (except JWT)
2. Always use HTTPS for API calls
3. Implement proper error handling
4. Sanitize user inputs
5. Use environment variables for sensitive data

## 🧪 Testing

### Running Tests

```bash
npm run test
# or
yarn test
```

## 📝 Code Style Guide

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for code formatting
- Write meaningful commit messages

## 🐛 Debugging

1. Use browser DevTools
2. Check Network tab for API calls
3. Use console.log() for debugging
4. Check localStorage for token presence

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [JWT.io](https://jwt.io)
- [Vercel Documentation](https://vercel.com/docs)
