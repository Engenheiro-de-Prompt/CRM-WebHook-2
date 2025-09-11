import os
import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# --- Configuration ---
# Load environment variables from a .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
# Enable CORS to allow requests from the frontend development server
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# --- Google API Configuration ---
# Define the scopes required for the application.
# If you modify these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
CREDENTIALS_FILE = 'backend/credentials.json'
TOKEN_FILE = 'backend/token.json'

# --- Helper Functions ---

def get_google_sheets_service():
    """
    Authenticates with the Google Sheets API and returns a service object.
    Handles the OAuth 2.0 flow. The user will need to run this script
    once from the command line to authorize the application.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first time.
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # IMPORTANT: The 'credentials.json' file must be downloaded from your
            # Google Cloud Console and placed in the 'backend' directory.
            if not os.path.exists(CREDENTIALS_FILE):
                raise FileNotFoundError(
                    "ERROR: 'credentials.json' not found. Please download it from "
                    "your Google Cloud Console and place it in the 'backend' directory."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            # The following line will start a local server and open a browser window
            # for the user to authorize the app. This must be done from a terminal.
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
            print("Authentication successful. Token saved to 'backend/token.json'")

    return build('sheets', 'v4', credentials=creds)

def parse_date(date_str):
    """
    Parses a date string from the sheet into a datetime object.
    Handles multiple common date formats. Returns None if parsing fails.
    """
    if not date_str:
        return None
    for fmt in ('%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d'):
        try:
            return datetime.datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue
    return None

# --- API Endpoints ---

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """
    API endpoint to fetch, parse, and categorize tasks from Google Sheets.
    """
    try:
        service = get_google_sheets_service()

        # Get Sheet ID and Range from environment variables
        spreadsheet_id = os.getenv('GOOGLE_SHEET_ID')
        range_name = os.getenv('GOOGLE_SHEET_RANGE')

        if not spreadsheet_id or not range_name:
            return jsonify({
                "error": "GOOGLE_SHEET_ID and GOOGLE_SHEET_RANGE must be set in the .env file."
            }), 500

        # Call the Sheets API
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=spreadsheet_id, range=range_name).execute()
        values = result.get('values', [])

        if not values:
            return jsonify({"today": [], "overdue": [], "upcoming": []})

        # --- Data Processing ---
        headers = [h.lower().strip() for h in values[0]]
        # The user's data is messy. We'll look for specific column names.
        # These names must match the column headers in your Google Sheet.
        try:
            # Adjust these column names if they are different in your sheet
            date_col_index = headers.index('due date')
            status_col_index = headers.index('status')
            priority_col_index = headers.index('priority')
        except ValueError as e:
            return jsonify({
                "error": f"Missing required column in Google Sheet: {e}. "
                         "Please ensure 'due date', 'status', and 'priority' columns exist."
            }), 400

        tasks = []
        for row in values[1:]:
            task = {header: row[i] if i < len(row) else '' for i, header in enumerate(headers)}
            tasks.append(task)

        # --- Task Categorization ---
        today = datetime.date.today()
        overdue_tasks = []
        today_tasks = []
        upcoming_tasks = []

        for task in tasks:
            due_date_str = task.get('due date')
            status = task.get('status', '').lower()

            due_date = parse_date(due_date_str)

            if not due_date or status in ['complete', 'done', 'concluído']:
                continue

            if due_date < today:
                overdue_tasks.append(task)
            elif due_date == today:
                today_tasks.append(task)
            # Consider tasks in the next 7 days as "upcoming"
            elif today < due_date <= today + datetime.timedelta(days=7):
                upcoming_tasks.append(task)

        # Sort today's tasks by priority (assuming priority is a number or text)
        def priority_key(t):
            priority = t.get('priority', '').lower()
            if priority == 'high' or priority == 'alta': return 1
            if priority == 'medium' or priority == 'média': return 2
            if priority == 'low' or priority == 'baixa': return 3
            return 4 # No priority

        today_tasks.sort(key=priority_key)

        return jsonify({
            "today": today_tasks,
            "overdue": overdue_tasks,
            "upcoming": upcoming_tasks
        })

    except FileNotFoundError as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    except HttpError as err:
        print(err)
        return jsonify({"error": f"An API error occurred: {err}"}), 500
    except Exception as e:
        print(e)
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


# --- Main Execution ---

if __name__ == '__main__':
    print("Starting Flask server...")
    print("IMPORTANT: If this is the first run, a browser window will open for you to")
    print("authorize this application to access your Google Sheets data.")
    print("Please follow the instructions in the browser.")
    # Using port 5001 to avoid potential conflicts with the frontend dev server
    app.run(host='0.0.0.0', port=5001, debug=True)
