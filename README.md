# Student Finance Tracker 💰

A premium, privacy-focused financial management tool designed for students. Built with a focus on modern aesthetics, accessibility, and high-performance vanilla web technologies.

## 🚀 Overview
The **Student Finance Tracker** helps you manage your budget, track expenses, and visualize your financial habits. It operates entirely on the client side, ensuring your data never leaves your device.

## 🛠️ Setup Guide
No installation or server-side setup is required. 

1. **Clone/Download** the repository to your local machine.
2. **Open** `index.html` in any modern web browser (Chrome, Firefox, Safari, or Edge).
3. **Start tracking!** Your data is automatically saved to your browser's `localStorage`.

## ✨ Key Features
- **Dashboard Analytics**: Real-time visualization of balance, income, and expenses with dynamic spending charts.
- **Budget Alerts**: Intelligent monitoring of monthly and category limits with ARIA-live notifications.
- **Full CRUD Support**: Create, Read, Update, and Delete transactions with ease.
- **Advanced Search & Filter**: Powerful regex-based search with real-time result highlighting.
- **Theme Engine**: Seamless switching between Standard Light and Deep Dark modes with persistent preferences.
- **Data Portability**: Export your records to JSON for backup or import them to restore your state.
- **Currency Support**: Dynamic support for RWF, USD, EUR, GBP, and JPY with real-time conversion simulation.

## 🔍 Regex Catalog
The application uses strict regular expression validation to ensure data integrity:
- **Description**: `/^\S(?:.*\S)?$/` (No leading/trailing whitespace).
- **Amount**: `/^(0|[1-9]\d*)(\.\d{1,2})?$/` (Positive number, max 2 decimals).
- **Category**: `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` (Letters, spaces, and hyphens only).
- **Date**: `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` (Valid YYYY-MM-DD format).
- **Repeated Words**: `/\b(\w+)\s+\1\b/i` (Flags consecutive duplicate words in descriptions).

## ⌨️ Keyboard Map
| Shortcut | Action |
| :--- | :--- |
| `Tab` / `Shift + Tab` | Navigate through interactive elements. |
| `Enter` / `Space` | Activate buttons, links, and toggles. |
| `Ctrl + Shift + D` | Toggle the Hidden Diagnostics Panel (Records Page). |
| `Esc` | Cancel inline editing in the transaction table. |

## ♿ Accessibility Notes
- **ARIA Live Regions**: Built-in announcements for budget alerts, search results, and system status.
- **Semantic HTML**: Proper use of `<main>`, `<nav>`, `<footer>`, and `<header>` for screen reader navigation.
- **Skip Links**: "Skip to Content" enabled for quick keyboard navigation.
- **Color Contrast**: AAA/AA compliant color palettes for both light and dark themes.
- **Focus States**: High-visibility focus indicators for all interactive elements.

## 🧪 Testing Instructions
1. **Validation**: Attempt to save a record with invalid data (e.g., empty description or negative amount) to trigger regex alerts.
2. **Search**: Enter a search term or a valid regex (e.g., `^Food`) to test the search engine and highlighting.
3. **Theme**: Toggle the theme in Settings and verify it persists across refreshes.
4. **Data**: Export your data, clear storage using the Diagnostics panel, then import the JSON to verify restoration.
5. **Responsive**: Resize the browser to verify the transition from Sidebar to Bottom Nav and Mobile Header.

## 📺 Demo Video
A comprehensive walkthrough of the application's features, including keyboard navigation, regex validation, and responsive design, is available here:
**[Watch the Demo on YouTube](https://youtu.be/bic9y5hAiFQ)**

---
*Built by Imanzi Beni · 2025*
