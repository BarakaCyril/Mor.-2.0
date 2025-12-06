# Mor. Cakes and Pastries

This is a full-stack e-commerce website for a bakery called "Mor. Cakes and Pastries". The frontend is built with HTML, CSS, and JavaScript, and the backend is a Python Flask application that handles payment processing with Pesapal.

## Technologies Used

### Frontend

*   HTML
*   CSS
*   JavaScript
*   [Vite](https://vitejs.dev/) for frontend tooling
*   [GSAP](https://greensock.com/gsap/) for animations
*   [Swiper.js](https://swiperjs.com/) for carousels

### Backend

*   Python
*   [Flask](https://flask.palletsprojects.com/)
*   [Flask-CORS](https://flask-cors.readthedocs.io/)
*   [Pesapal API](https://developer.pesapal.com/) for payments

## Setup and Installation

### Frontend

1.  Navigate to the root directory of the project.
2.  Install the necessary Node.js dependencies:
    ```bash
    npm install
    ```

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a Python virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    *   On Windows:
        ```bash
        venv\Scripts\activate
        ```
    *   On macOS and Linux:
        ```bash
        source venv/bin/activate
        ```
4.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
5.  Create a `.env` file in the `backend` directory and add your Pesapal API credentials:
    ```
    PESAPAL_CONSUMER_KEY=your_consumer_key
    PESAPAL_CONSUMER_SECRET=your_consumer_secret
    PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3
    ```

## Running the Application

### Frontend

1.  In the root directory of the project, run the following command to start the Vite development server:
    ```bash
    npm run dev
    ```

### Backend

1.  Navigate to the `backend` directory.
2.  Run the Flask application:
    ```bash
    python app.py
    ```

## Project Structure

```
mor/
├── backend/
│   ├── app.py              # Flask backend application
│   └── requirements.txt    # Python dependencies
├── node_modules/
├── public/                 # Static assets (images, videos)
├── src/
│   ├── *.html              # HTML pages
│   ├── javascript/
│   │   ├── *.js            # JavaScript files
│   └── styles/
│       └── *.css           # CSS stylesheets
├── .gitignore
├── index.html              # Main HTML file
├── package.json            # Frontend dependencies and scripts
└── README.md               # Project documentation
```