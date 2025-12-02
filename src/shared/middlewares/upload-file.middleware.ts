import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import mime from 'mime-types';
import { nanoid } from 'nanoid';
import path from 'node:path';
import { Logger } from 'pino';
import { IMiddleware } from '../interfaces/middleware.interface.js';

export interface UploadFileOptions {
  uploadDir: string;
  maxFileSize?: number;
  allowedMimes?: string[];
}

export class UploadFileMiddleware implements IMiddleware {
  private upload: multer.Multer;
  private options: Required<UploadFileOptions>;

  constructor(
    options: UploadFileOptions,
    private logger: Logger
  ) {
    this.options = {
      uploadDir: options.uploadDir,
      maxFileSize: options.maxFileSize || 5 * 1024 * 1024, // 5MB
      allowedMimes: options.allowedMimes || ['image/jpeg', 'image/png', 'image/webp']
    };

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.options.uploadDir);
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
      if (!this.options.allowedMimes.includes(file.mimetype)) {
        this.logger.warn(`Invalid file type: ${file.mimetype}`);
        cb(new Error(`Invalid file type. Allowed types: ${this.options.allowedMimes.join(', ')}`));
        return;
      }
      cb(null, true);
    };

    this.upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.options.maxFileSize
      }
    });
  }

  execute(req: Request, res: Response, next: NextFunction): void {
    this.upload.single('avatar')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        this.logger.error(`Multer error: ${err.message}`);

        const statusCode = StatusCodes.BAD_REQUEST;
        let message = err.message;

        if (err.code === 'FILE_TOO_LARGE') {
          message = `File is too large. Maximum size: ${this.options.maxFileSize / 1024 / 1024}MB`;
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          message = 'Too many files uploaded';
        }

        res.status(statusCode).json({
          error: 'Upload Error',
          message
        });
        return;
      }

      if (err) {
        this.logger.error(`File upload error: ${err.message}`);
        res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Upload Error',
          message: err.message
        });
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
}
