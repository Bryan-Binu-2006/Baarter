# Baarter - Hyperlocal Barter Web Application

Baarter is a modern, hyperlocal community web app that enables neighbors to trade goods and services without money. It’s designed to foster local connections and a sustainable, cashless economy within neighborhoods.

---

## 🚀 Features

- **Authentication & Onboarding**
  - Email/password signup and login
  - Multi-step profile setup wizard (basic info, address, bio)
- **Community Management**
  - Create or join location-based communities
  - Switch between communities
- **Listings & Barter**
  - Create, browse, and remove product/service listings
  - Filter and search listings
  - Only listing owners can remove their own listings
- **Barter Requests & Workflow**
  - Send barter requests for listings
  - Owners can accept/decline requests
  - Mutual acceptance required before final confirmation
  - Private chat unlocks after both accept
  - Dedicated confirmation page for secure code-based barter completion
  - Listings are automatically removed after successful barter
- **Trust & Safety**
  - Trust score system (profile completion, future: endorsements, ratings)
  - Confirmation codes for secure exchanges
- **Notifications**
  - In-app notification center with badge
  - Mark as read, clear all, and clear read notifications
- **Requests Management**
  - Declutter requests tab: hide (X) any request from your view
- **Responsive UI**
  - Mobile-friendly, clean, and modern design (Tailwind CSS)
- **No Backend Required**
  - All data is stored in localStorage for easy demo/testing

---

## 🏗️ Project Structure

```
src/
  components/      # UI components (Dashboard, AuthForm, BarterChat, etc.)
  contexts/        # React Contexts for Auth and Community
  hooks/           # Custom React hooks
  services/        # Business logic and localStorage APIs
  types/           # TypeScript type definitions
  index.css        # Tailwind CSS imports
  App.tsx          # Main app component and routing
  main.tsx         # App entry point
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React Icons
- **Routing:** react-router-dom
- **State:** React Context API, localStorage
- **Linting:** ESLint

---

## 📦 Installation

1. **Clone the repo:**
   ```sh
   git clone https://github.com/Bryan-Binu-2006/Baarter.git
   cd baarter
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```

4. **Open in your browser:**
   ```
   http://localhost:5173/
   ```

---

## 📝 Usage

- **Sign up** and complete your profile.
- **Join or create** a community.
- **Add listings** for products or services you want to trade.
- **Send and manage barter requests** from the dashboard.
- **Chat and confirm** barters securely with unique codes.
- **Manage notifications** and declutter your requests tab as needed.

---

## 🧩 Customization

- **Change the vibe/theme:**  
  Edit `tailwind.config.js` and update Tailwind classes in components for a new look.
- **Add new features:**  
  The codebase is modular and ready for enhancements like ratings, endorsements, or real backend integration.

---

## 📄 License

MIT

---

## 🙏 Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [react-router-dom](https://reactrouter.com/)

---

**Happy bartering!** 