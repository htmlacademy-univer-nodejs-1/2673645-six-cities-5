import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer, { MulterError } from 'multer';
import mime from 'mime-types';
import { nanoid } from 'nanoid';
import { Logger } from 'pino';
import { IMiddleware } from '../interfaces/middleware.interface.js';

export interface UploadFileOptions {
  uploadDir: string;
  fieldName?: string;
  maxFileSize?: number;
  allowedMimes?: string[];
}

export class UploadFileMiddleware implements IMiddleware {
  private upload: multer.Multer;
  private fieldName: string;

  constructor(
    options: UploadFileOptions,
    private logger: Logger
  ) {
    this.fieldName = options.fieldName || 'avatar';

    const maxFileSize = options.maxFileSize || 5 * 1024 * 1024;
    const allowedMimes = options.allowedMimes || ['image/jpeg', 'image/png', 'image/webp'];

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, options.uploadDir);
      },
      filename: (req, file, cb) => {
        const filename = nanoid();
        const ext = mime.extension(file.mimetype);
        const finalFilename = `${filename}.${ext}`;

        this.logger.debug(`File will be saved as: ${finalFilename}`);
        cb(null, finalFilename);
      }
    });

    const fileFilter = (
      req: Express.Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      if (!allowedMimes.includes(file.mimetype)) {
        this.logger.warn(`Invalid file type: ${file.mimetype}`);
        cb(null, false);
        return;
      }
      cb(null, true);
    };

    this.upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: maxFileSize
      }
    });
  }

  execute(req: Request, res: Response, next: NextFunction): void {
    const uploadHandler = this.upload.single(this.fieldName);

    uploadHandler(req, res, (err: any) => {
      if (err) {
        this.handleUploadError(err, res);
        return;
      }

      if (!req.file) {
        this.logger.warn('No file provided in request');
        res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'No file provided'
        });
        return;
      }

      this.logger.info(`File uploaded successfully: ${req.file.filename}`);
      next();
    });
  }

  private handleUploadError(err: any, res: Response): void {
    if (err instanceof MulterError) {
      this.logger.error(`Multer error: ${err.message}, code: ${err.code}`);

      const errorMessages: Record<string, string> = {
        'LIMIT_FILE_SIZE': 'File is too large. Maximum size: 5MB',
        'LIMIT_FILE_COUNT': 'Too many files uploaded',
        'LIMIT_UNEXPECTED_FILE': 'Unexpected field name for file upload',
        'LIMIT_FIELD_KEY': 'Field name is too long',
        'LIMIT_FIELD_VALUE': 'Field value is too long',
        'LIMIT_FIELD_COUNT': 'Too many fields',
        'LIMIT_PART_COUNT': 'Too many parts'
      };

      const message = errorMessages[err.code] || err.message;

      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Upload Error',
        message
      });
      return;
    }

    this.logger.error(`File upload error: ${err.message}`);
    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Upload Error',
      message: err.message
    });
  }
}
