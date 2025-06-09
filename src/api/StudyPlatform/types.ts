export interface Module {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  tags: Tag[];
  name: string;
  description: string;
  image: string;
  price: string;
  discount: number;
  is_discount: boolean;
  sell_price: string;
  mine: boolean;
  course_progress: number;
  lessons_amount: number;
}

// If you expect an array of courses:
export type CourseList = Course[];

export interface Lesson {
  id: number;
  name: string;
  is_passed: boolean;
  is_free: boolean;
}

export interface ModuleDetail {
  id: number;
  name: string;
  description: string;
  mine: boolean;
  module_progress: number;
  lessons_count: number;
  lessons_list: Lesson[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface CourseDetail {
  id: number;
  name: string;
  short_description: string;
  description: string;
  price: string;
  discount: number;
  is_discount: boolean;
  sell_price: string;
  image: string;
  tags: Tag[];
  mine: boolean;
  course_progress: number;
  lessons_amount: number;
  course_goal: string;
  modules: ModuleDetail[];
}

export interface Video {
  id: number;
  title: string;
  url: string;
}

export interface NavLesson {
  id: number;
  passed: boolean;
  name: string;
  is_accessible: boolean;
}

export interface NavModule {
  id: number;
  name: string;
  passed: boolean;
  lessons: NavLesson[];
}

export interface LessonDetail {
  id: number;
  name: string;
  description: string;
  text_home_task: string;
  is_free: boolean;
  quize: number;
  videos: Video[];
  nava_data: NavModule[];
  pdf_task: string;
}

interface Answer {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

interface NaviLesson {
  id: number;
  name: string;
  passed: boolean;
  is_accessible: boolean;
}

interface NaviData {
  id: number;
  name: string;
  passed: boolean;
  lessons: NaviLesson[];
}

export interface Quiz {
  id: number;
  title: string;
  questions: Question[];
  nava_data: NaviData[];
}

export interface QuizAnswerPayload {
  question: number;
  selected_answer: number;
}

export interface QuizSubmissionPayload {
  quiz: number | string;
  answers: QuizAnswerPayload[];
}

export interface QuizSubmissionResponse {
  id: number;
  quiz: number;
  answers: QuizAnswerPayload[];
  submitted_at: string;
}

export interface PaymentResponse {
  payment: {
    id: number;
    order_reference: string;
    status: 'PENDING' | 'SUCCESS' | 'DECLINED';
    created_at: string;
    user: number;
    course: number;
  };
  payment_url: string;
}

export interface PaymentStatusCheckResponse {
  status: string;
}