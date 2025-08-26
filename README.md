# SolutionIn-Calculator

An **AI-Powered Calculator** that solves **math word problems** using the **Gemini API**, with a **local fallback engine** when the API is unavailable.  
Built with **TailwindCSS + JavaScript (frontend)** and **Node.js + Express (backend)**.

---

## Features

- **AI Word Problem Solver**  
  Input natural-language math problems → get step-by-step solutions.

- **Gemini API Integration**  
  Uses the Gemini API for accurate AI-powered calculations.  
  `apiURL` is configurable in environment variables.

- **Local Fallback (Offline Mode)**  
  If API key is missing or Gemini is unreachable → a **local solver** automatically handles basic word problems.

- **Responsive UI**  
  Built with TailwindCSS for clean, mobile-friendly design.

- **Secure Key Handling**  
  API keys are stored in `.env` (never pushed to GitHub).

---

## Tech Stack

**Frontend**  
- HTML, JavaScript  
- TailwindCSS (styling)

**Backend**  
- Node.js  
- Express.js

**AI Integration**  
- Gemini API (configurable `apiURL`)  
- Local Fallback Solver (for offline/basic use)

---

## How It Works

1. **Frontend Input**  
      ```bash
        User enters a word problem (e.g., "A box has 12 apples and I buy 3 boxes, how many apples in total?").  

2. **Backend Request** 
   ```bash
    If GEMINI_API_KEY exists → request sent to apiURL (Gemini).
   
    Else → local solver is triggered.  

4. **Fallback Logic**  
   ```js
   if (process.env.GEMINI_API_KEY) {
       // Use Gemini API
   } else {
       // Use local solver (basic math parser)
   }
5. **Response**
      ```bash
      Solution returned as structured JSON → frontend displays step-by-step answer.

**********************************************************************************************************************************************************************************


# Installation & Setup

1. Clone the repository
   ```bash
   git clone https://github.com/<your-username>/SolutionIn-Calculator.git
   
   cd SolutionIn-Calculator

2. Install dependencies
   ```bash
   npm install

3. Setup environment variables
   Create a .env file in the root folder:
     ```bash
   GEMINI_API_KEY=your_api_key_here
     
   API_URL=https://gemini.googleapis.com/v1/solve 

4. Run locally
    ```bash
      npm run dev

- Visit http://localhost:3000



## Example Usage

Input:
If a train has 12 compartments and each has 48 seats, how many seats are there in total?

Output (Gemini API or Local Solver)
576 seats (12 × 48 = 576)


## 🔒 Security

- node_modules/ and .env are ignored via .gitignore

- API keys are never committed

- Local solver ensures basic functionality even without internet


## 📂 Project Structure  
SolutionIn-Calculator/

├── public/            Frontend (HTML, JS, Tailwind)

├── server/            Node.js + Express backend

├── .gitignore

├── LICENSE

├── README.md

└── package.json

- License
This project is licensed under the MIT License — see LICENSE for details.
## 🤝 Contributing

- Contributions, issues, and feature requests are welcome!
- Feel free to open a PR or create an issue.

## Support

- If you like this project, star the repo ⭐ on GitHub to support development!
