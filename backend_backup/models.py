from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LoginRequest(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    password: str

class TrainingHistoryItem(BaseModel):
    id: str
    trainee_id: str
    training_id: str
    training_type: str  # "Activity", "Game", "AR Scenario", "Lesson"
    training_name: str
    date: str
    time: str
    timestamp: str
    score: str
    xp_delta: int
    accuracy: str
    time_taken: str
    status: str
    attempt_number: int
    question: Optional[str] = None
    selected_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    explanation: Optional[str] = None
    mistakes: List[str] = []
    improvement_notes: Optional[str] = None
    previous_attempts_summary: List[Dict[str, Any]] = []

class WorkerProfile(BaseModel):
    id: str
    name: str
    role: str = "Underground Coal Miner"
    mine_location: str = "Dhanbad Seam #4 (BCCL)"
    level: int = 1
    level_title: str = "Mining Trainee"
    xp: int = 120
    progress_pct: int = 28
    competency_score: float = 78.5
    avatar_url: str = "assets/images/worker_avatar.svg"
    streaks: int = 4
    notifications_count: int = 2
    language: str = "en"
    voice_guidance: bool = True
    sound_fx: bool = True

class ScenarioModel(BaseModel):
    id: str
    title: str
    category: str
    hazard_type: str
    location: str
    difficulty: str
    description: str
    time_limit_sec: int = 60
    correct_equipment: str
    correct_approach: str
    pass_steps_required: List[str]

class AttemptSubmission(BaseModel):
    worker_id: str
    scenario_id: str
    duration_ms: int
    hazard_rec_ms: int
    equipment_selected: str
    approach_position: str
    pass_steps_completed: List[str]
    mistakes: List[str] = []
    is_offline: bool = False

class AttemptResult(BaseModel):
    id: str
    worker_id: str
    scenario_id: str
    timestamp: str
    xp_awarded: int
    new_total_xp: int
    new_level: int
    new_level_title: str
    new_progress_pct: int
    accuracy_score: float
    speed_score: float
    procedure_score: float
    hazard_rec_score: float
    competency_score: float
    passed: bool
    badges_unlocked: List[str] = []
    feedback: List[str] = []
    retraining_needed: bool = False
    recommended_module: Optional[str] = None

class SafetyEvent(BaseModel):
    worker_id: str
    scenario_id: str
    event_type: str
    severity: str
    details: str
    timestamp: Optional[str] = None

class CertificateModel(BaseModel):
    cert_id: str
    worker_id: str
    worker_name: str
    course_name: str = "DGMS Underground Mine Fire Safety & PASS Extinguisher Standard"
    competency_score: float
    issue_date: str
    cert_hash: str
    verification_url: str
    status: str = "ISSUED"  # "ELIGIBLE", "ISSUED"
    issued_by_supervisor_id: Optional[str] = "admin_supervisor"

class SyncPayload(BaseModel):
    worker_id: str
    attempts: List[AttemptSubmission]
    events: List[SafetyEvent] = []

class SyncResponse(BaseModel):
    status: str
    synced_attempts: int
    updated_worker: WorkerProfile

# --- NEW MODELS FOR EXTENDED HISTORY, ACTIVITIES, GAMES, & SUPERVISOR --- #

class ActivityItem(BaseModel):
    id: str
    title: str
    category: str
    description: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str

class ActivityAttemptSubmission(BaseModel):
    trainee_id: str
    activity_id: str
    selected_answer: str
    time_taken_sec: float

class ActivityAttemptRecord(BaseModel):
    id: str
    trainee_id: str
    activity_id: str
    activity_title: str
    activity_category: str
    attempt_number: int
    question: str
    options: List[str]
    selected_answer: str
    correct_answer: str
    is_correct: bool
    score: int
    xp_delta: int
    time_taken_sec: float
    timestamp: str
    explanation: str
    mistakes: List[str] = []
    improvement_notes: Optional[str] = None

class GameAttemptSubmission(BaseModel):
    trainee_id: str
    game_id: str
    score_pct: int
    time_taken_sec: int
    hazards_found: int
    total_hazards: int
    mistakes_count: int
    xp_earned: int

class GameAttemptRecord(BaseModel):
    id: str
    trainee_id: str
    game_id: str
    attempt_number: int
    score_pct: int
    time_taken_sec: int
    hazards_found: int
    total_hazards: int
    mistakes_count: int
    xp_earned: int
    timestamp: str

class DailyProgressRecord(BaseModel):
    id: str
    trainee_id: str
    day_name: str  # "Mon", "Tue", etc.
    date: str
    lessons_completed: int
    activities_completed: int
    games_completed: int
    ar_scenarios_completed: int
    training_time_min: int
    avg_accuracy: float
    xp_earned: int
    xp_lost: int
    competency_score: float
    overall_progress: int

class IssueCertificateRequest(BaseModel):
    trainee_id: str
    supervisor_id: str
    notes: Optional[str] = "Approved after complete competency audit and simulation review."

class AuditLogItem(BaseModel):
    id: str
    actor_id: str
    actor_role: str
    action: str
    target_id: Optional[str]
    details: str
    timestamp: str

class LessonProgressUpdate(BaseModel):
    trainee_id: str
    lesson_id: str
    part_id: str
    video_url: str
    watched_pct: float
    last_position_sec: float
    is_completed: bool

class LessonQuizSubmission(BaseModel):
    trainee_id: str
    lesson_id: str
    part_id: str
    question: str
    selected_answer: str
    time_taken_sec: Optional[float] = 5.0

