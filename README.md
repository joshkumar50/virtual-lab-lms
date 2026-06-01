## 👥 Team Name: Nexbit
##    Members :
##            1. Chittei Josh Kumar
##            2. Singamsetty Venkata Naga Sai
##            3. Kota Bindu Mohan Sai
##            4. Koppula Likith Kumar
##            5. Shaik Mansoor
-------------------------------
## 🚀 New Features (v3.0 - Civic Tech Upgrade)
- 🏛️ **Civic Tech & State-Level Monitoring** (v3.0) [NEW]
  - 🏘️ **Institutional Siloing:** Automatic data isolation for schools/colleges.
  - 📊 **Impact Dashboard:** Public transparency metrics for government tracking.
  - 🛡️ **Education Officer Role:** State-level verification and monitoring.
  - ⚡ **Lite Mode:** Optimized performance for low-bandwidth rural connectivity.
  - 📚 **Teacher Resource Center:** Centralized curriculum and lab guide repository.
- 🔬 **Professional PhET Integration** (Ohm's Law, Double Slit, pH Scale, and Pendulum Lab).
- 🤖 **AI-Powered Auto-Grading** (Powered by local LLM **Ollama + qwen3:8b**).
- 📝 **Smart Feedback System** (Instant analysis, scientific accuracy checks, and improvement suggestions).
- 🕵️‍♂️ **Branding-Free UI** (Customized simulations for a native platform experience).
- 🎯 **Specialized Views** (Directly locks to the most relevant experiment screen).
- 📺 Added video section in courses (Video + Meet link Now Available).
- 🏛️ **Civic Tech & State-Level Monitoring** (v3.0) [NEW]
  - 🏘️ **Institutional Siloing:** Automatic data isolation for schools/colleges.
  - 📊 **Impact Dashboard:** Public transparency metrics for government tracking.
  - 🛡️ **Education Officer Role:** State-level verification and monitoring.
  - ⚡ **Lite Mode:** Optimized performance for low-bandwidth rural connectivity.
  - 📚 **Teacher Resource Center:** Centralized curriculum and lab guide repository.


-------------------------------
## ⚙️ Technical Stack & Dependencies
We’ve built the platform using the **MERN stack**:
- **MongoDB** – for data storage  
- **Express.js** – backend framework  
- **React.js** – frontend framework  
- **Node.js** – server environment  
- **Ollama** – Local AI Model Runner (server-side)  

### 🧩 Frontend Libraries & Tools
- **React Router DOM** – client-side routing  
- **Framer Motion** – smooth animations  
- **Tailwind CSS** – responsive styling  
- **Axios** – API requests  
- **Lucide React** – modern icons  
- **React Hot Toast** – user notifications  

### 🧠 Backend Libraries
- **Mongoose** – MongoDB modeling  
- **jsonwebtoken (JWT)** – authentication  
- **bcrypt** – password encryption  
- **helmet** and **cors** – security middleware  
- **dotenv** – environment configuration  
- **express-rate-limit** – API protection  

### ☁️ Deployment
- **Frontend:** Vercel  
- **Backend:** Render  
- **Database:** MongoDB Atlas (cloud)  

------------------------------------------------------

## 🚀 Features Implemented — Virtual Lab LMS (Team Nexbit)

---------------------------------------------------------------

### 🥉 Bronze Level — Basic Functionality

#### 🧾 1. User Registration & Login
- 🔐 Users can register with **name, email, password, and role** (Student or Teacher).  
- 🔒 Secure authentication using **JWT tokens** and **bcrypt password encryption**.  
- 👤 Login system redirects users based on their role (Student or Teacher dashboard).  
- 🧠 Session persistence with local storage and token validation.  

#### 📚 2. Course Management (Teacher Role)
- 👩‍🏫 Teachers can **create, edit, and publish courses** with title, description, and duration.  
- 🧾 Courses are stored in **MongoDB** and fetched dynamically to the homepage.  
- 👨‍🎓 Students can **view all available courses** and read course details before enrolling.  

-------------------------

### 🥈 Silver Level — Intermediate Functionality

#### 🎓 3. Course Enrollment
- ✅ Students can **enroll** in available courses with one click.  
- 📋 The system maintains **enrolled course lists** for each student.  
- 👩‍🏫 Teachers can view **all students enrolled** in their courses via the teacher dashboard.  
- 🔄 Enrollment data is stored securely in MongoDB with **real-time updates**.  

-------------------------

### 🥇 Gold Level — Advanced Functionality

#### 🧪 4. Assignment & Experiment Submission
- 📘 Teachers can **assign virtual experiments or lab assignments** to a course.  
- 🔬 Students can **perform interactive experiments** directly within the LMS, including:  
  - 🔬 **Pendulum Laboratory** (Harmonic motion & period analysis) [NEW]
  - 🧪 Chemistry Lab (pH Scale & Molarity)
  - ⚡ Ohm’s Law Lab (Voltage, Current, Resistance)
  - 🌊 Double Slit Experiment (Wave interference)
  - 🔌 Circuit Analysis Lab
  - 💡 Logic Gate Simulator
- 📤 Students can **submit lab results** for instant evaluation.  
- ⏱️ Submissions are **graded instantly** using **Local AI (Ollama)**.  
- 📊 Students receive **detailed AI-generated feedback** (scores + specific improvement tips).  

-----------------------

### 💎 Platinum Level — Expert Functionality

#### 🧠 5. Intelligent AI Auto-Grading System
- ⚡ **AI-Powered Analysis**: Uses **Ollama (qwen3:8b)** to read and understand student reports.
- 🎯 **Deep Understanding**: Validates scientific accuracy, experimental logic, and report quality.
- 💰 **Private & Free**: Runs locally on the server—no expensive external APIs or data privacy concerns.
- 🧾 **Rich Feedback**: Generates a structured JSON report with:
  - Scientific Accuracy Score (40%)
  - Experimental Method Score (20%)
  - Analysis Quality Score (25%)
  - Report Quality Score (15%)
  - **Constructive suggestions** for improvement.  

#### ✏️ 6. Teacher Override & Hybrid Grading
- 👩‍🏫 Teachers can **override auto-grades manually** for quality assurance.  
- 📄 System keeps **history of original vs. overridden grades** for transparency.  
- 🧠 Combines **automation with human judgment** — the best of both worlds.  

---------------------

### ⭐ Bonus & Optional Advanced Features (Beyond Platinum)

#### 🧭 7. Role-Based Dashboards
- 🧑‍🎓 **Student Dashboard:**  
  - View enrolled courses and labs  
  - Submit experiments  
  - View instant feedback & scores  
  - Track overall progress  

- 👩‍🏫 **Teacher Dashboard:**  
  - Create & manage courses  
  - Assign labs  
  - Review submissions & override grades  
  - Monitor student analytics & engagement hours  

#### 🔬 8. Interactive Virtual Laboratory System
- Built with **PhET Interactive Simulations + Pure JavaScript**.
- High-fidelity physics and chemistry experiments used by thousands of schools worldwide.
- **Customized for LMS:** Removed external branding and links for a seamless, professional experience.
- **Focused Learning:** Automatically opens on specific experiment screens (e.g., pH "Macro" view, Pendulum "Lab" view).
- Accessible from any device — **lightweight and fast loading**.

#### 📊 9. Analytics & Progress Tracking
- Real-time **student progress reports** per course/lab.  
- Graphical analytics (using **Recharts / Chart.js**).  
- Displays **submission count, grade trends, and completion rates**.  

#### 🔐 10. Security & Reliability
- **JWT-based authentication** and authorization.  
- **Role-based access control** (Teacher / Student).  
- **Password encryption** using bcryptjs.  
- **Rate limiting**, Helmet, and CORS for secure API access.  
- Protected backend routes with **role verification middleware**.  

-----------------------

### 🏆 Elite Class — Civic Tech & State-Level Monitoring (Team Nexbit) [NEW]

#### 🏘️ 11. Institutional Data Isolation (Siloing)
- **Problem Solved:** Prevents data mixing between schools. 
- **The Solution:** Every Teacher and Student is linked to a verified **Institution ID**. 
- **Privacy First:** Courses and Assignments created by "Teacher A" in "School X" are strictly invisible to students in "School Y".
- **Secure Registration:** Students and Teachers select their district-verified school from a secure dropdown during signup.

#### 📊 12. Civic Tech Transparency Dashboard
- **Public Impact Metrics:** A live, public-facing dashboard (`/transparency`) that shows the real-world impact of the platform across the state.
- **Analytics tracked:**
  - Total verified institutions onboarded.
  - Cumulative virtual labs completed.
  - Multi-state/District participation metrics.
- **Trust Factor:** Demonstrates accountability and progress to government stakeholders and the public.

#### 🛡️ 13. Education Officer Verification System
- **Government Oversight:** A specialized role for state officials to monitor and manage education infrastructure.
- **Verification Engine:** Officers review UDISE/AISHE codes of registering schools. Only verified schools can host students and teachers.
- **Real-time Monitoring:** Officers can monitor rural education participation without intruding on individual classroom privacy.

#### ⚡ 14. Rural Connectivity Mode (Lite Mode)
- **Inclusivity:** Built specifically for rural schools with low-bandwidth internet.
- **Optimization:** A global toggle that swaps high-resolution assets for lightweight UI elements and optimized CSS.
- **Access for All:** Ensures the "Right to Digital Education" is possible even in remote villages.

