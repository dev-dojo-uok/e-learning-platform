import { QuizService } from '../services/quiz.service.js';

export class QuizController {
  static async create(req, res, next) {
    try {
      const { sectionId, courseId, title, hasTimeLimit, timeLimitMinutes, minPassMark, reviewPolicy, reviewPublishTime, questionsJson } = req.body;
      const quiz = await QuizService.createQuiz({
        sectionId,
        courseId,
        title,
        hasTimeLimit,
        timeLimitMinutes,
        minPassMark,
        reviewPolicy,
        reviewPublishTime,
        questionsJson
      });
      res.status(201).json(quiz);
    } catch (error) {
      next(error);
    }
  }

  static async getByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const quizzes = await QuizService.getQuizzesByCourse(courseId);
      res.status(200).json(quizzes);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;
      const userId = req.user?.id;
      const quiz = await QuizService.getQuizById(id, userRole, userId);
      res.status(200).json(quiz);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, hasTimeLimit, timeLimitMinutes, minPassMark, reviewPolicy, reviewPublishTime, questionsJson } = req.body;
      const quiz = await QuizService.updateQuiz(id, {
        title,
        hasTimeLimit,
        timeLimitMinutes,
        minPassMark,
        reviewPolicy,
        reviewPublishTime,
        questionsJson
      });
      res.status(200).json(quiz);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await QuizService.deleteQuiz(id);
      res.status(200).json({ message: 'Quiz and corresponding material deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async startAttempt(req, res, next) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;
      const attempt = await QuizService.startAttempt(id, studentId);
      res.status(201).json(attempt);
    } catch (error) {
      next(error);
    }
  }

  static async submitAttempt(req, res, next) {
    try {
      const { attemptId } = req.params;
      const studentId = req.user.id;
      const { submittedAnswersJson } = req.body;
      const attempt = await QuizService.submitAttempt(attemptId, studentId, { submittedAnswersJson });
      res.status(200).json(attempt);
    } catch (error) {
      next(error);
    }
  }

  static async getAttemptById(req, res, next) {
    try {
      const { attemptId } = req.params;
      const userRole = req.user?.role;
      const userId = req.user?.id;
      const attempt = await QuizService.getAttemptById(attemptId, userRole, userId);
      res.status(200).json(attempt);
    } catch (error) {
      next(error);
    }
  }

  static async getAttemptsByQuiz(req, res, next) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;
      const userId = req.user?.id;
      const attempts = await QuizService.getAttemptsByQuiz(id, userRole, userId);
      res.status(200).json(attempts);
    } catch (error) {
      next(error);
    }
  }

  static async gradeAttempt(req, res, next) {
    try {
      const { attemptId } = req.params;
      const { score, teacherFeedback } = req.body;
      const attempt = await QuizService.gradeAttempt(attemptId, { score, teacherFeedback });
      res.status(200).json(attempt);
    } catch (error) {
      next(error);
    }
  }
}
