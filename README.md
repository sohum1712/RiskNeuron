# SwiftCover - AI-Powered Parametric Micro-Insurance

SwiftCover is an innovative parametric micro-insurance platform designed specifically for Q-Commerce (quick commerce) gig workers in India. It provides instant, automated income protection against disruptions like floods, extreme heat, and severe pollution.

## Features

- **AI-Powered Risk Assessment**: Machine learning models for risk scoring, income prediction, and fraud detection
- **Parametric Insurance**: Instant automated payouts based on verified disruption events
- **Real-time Monitoring**: Track earnings, claims, and disruptions in real-time
- **Worker Dashboard**: Intuitive interface for policy management and claims
- **Admin Dashboard**: Comprehensive analytics and platform management
- **Flexible Plans**: Basic, Standard, and Premium coverage options

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **scikit-learn** - Machine learning models
- **Uvicorn** - ASGI server

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management
- **Recharts** - Data visualization

## Project Structure

```
swiftcover/
├── backend/
│   ├── database/          # Database models and connection
│   ├── ml/                # Machine learning models
│   ├── routers/           # API endpoints
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   ├── main.py            # Application entry point
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # State management
│   │   └── types/        # TypeScript types
│   └── package.json      # Node dependencies
├── docker-compose.yml    # Docker configuration
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/swiftcover.git
cd swiftcover
```

2. **Set up PostgreSQL**
```sql
CREATE DATABASE swiftcover;
```

3. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

4. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. **Frontend Setup**
```bash
cd frontend
npm install
```

### Running the Application

**Backend** (from backend directory):
```bash
python main.py
```
Backend runs on http://localhost:8000
API docs at http://localhost:8000/docs

**Frontend** (from frontend directory):
```bash
npm run dev
```
Frontend runs on http://localhost:5173

### Using PowerShell Scripts (Windows)

From project root:
```powershell
# Setup
.\setup-backend.ps1
.\setup-frontend.ps1

# Start services
.\start-backend.ps1   # In one terminal
.\start-frontend.ps1  # In another terminal
```

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

- `POST /api/workers` - Register new worker
- `GET /api/workers/{id}` - Get worker details
- `POST /api/policies` - Create insurance policy
- `GET /api/disruptions` - List disruption events
- `POST /api/claims/evaluate` - Evaluate claim
- `GET /api/analytics/dashboard` - Get dashboard metrics

## Machine Learning Models

SwiftCover uses three ML models:

1. **Risk Scoring Model**: Assesses worker risk based on location, experience, and work patterns
2. **Income Prediction Model**: Predicts expected earnings considering day-of-week patterns
3. **Fraud Detection Model**: Identifies suspicious claims using isolation forest algorithm

Models are automatically trained on first run using synthetic data.

## Database Schema

Key tables:
- `workers` - Worker profiles and risk scores
- `policies` - Insurance policies and coverage
- `disruption_events` - Weather/environmental disruptions
- `claims` - Claim records and payouts
- `worker_activity` - Daily work activity logs
- `premium_payments` - Payment records

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Backend linting
cd backend
flake8 .

# Frontend linting
cd frontend
npm run lint
```

## Docker Deployment

```bash
docker-compose up -d
```

Services:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built for Q-Commerce gig workers in India
- Inspired by parametric insurance innovations
- Powered by AI/ML for automated decision-making

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review API docs at `/docs` endpoint

---

**Note**: This is a demonstration project. For production use, implement proper security measures, authentication, and compliance with insurance regulations.
