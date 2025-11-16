const swaggerDocument = {
  swagger: '2.0',
  info: {
    title: 'RentFit API',
    description:
      "Backend API for RentFit.ai - India's rent management platform for tenants & property owners",
    version: '1.0.0',
    contact: {
      name: 'RentFit Team',
    },
  },
  host: process.env.SWAGGER_HOST || 'localhost:4000',
  schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http', 'https'],
  basePath: '/api',
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
      bearerFormat: 'JWT',
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Check if the API is running',
        responses: {
          200: {
            description: 'API is healthy',
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                message: { type: 'string', example: 'RentFit API is running' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new user account and get authentication token',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/CreateUserRequest',
            },
          },
        ],
        responses: {
          201: {
            description: 'User registered successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User registered successfully' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          409: {
            description: 'User already exists',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticate user with email and password',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john.doe@example.com',
                },
                password: {
                  type: 'string',
                  example: 'SecurePass123',
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: 'Login successful',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Login successful' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          401: {
            description: 'Invalid credentials',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh JWT token',
        description: 'Generate a new JWT token for the authenticated user',
        produces: ['application/json'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Token refreshed successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Token refreshed successfully' },
                data: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Get the profile of the currently authenticated user',
        produces: ['application/json'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change user password',
        description: 'Change the password for the authenticated user',
        consumes: ['application/json'],
        produces: ['application/json'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              required: ['currentPassword', 'newPassword'],
              properties: {
                currentPassword: {
                  type: 'string',
                  example: 'OldPassword123',
                },
                newPassword: {
                  type: 'string',
                  minLength: 8,
                  example: 'NewPassword123',
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: 'Password changed successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Password changed successfully' },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          401: {
            description: 'Authentication required or invalid current password',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        description: 'Register a new user in the system',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/CreateUserRequest',
            },
          },
        ],
        responses: {
          201: {
            description: 'User created successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User created successfully' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          409: {
            description: 'User already exists',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieve a list of users with pagination and filtering options',
        produces: ['application/json'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            minimum: 1,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Number of items per page',
          },
          {
            name: 'role',
            in: 'query',
            type: 'string',
            enum: ['tenant', 'landlord', 'admin'],
            description: 'Filter by user role',
          },
          {
            name: 'isActive',
            in: 'query',
            type: 'boolean',
            description: 'Filter by active status',
          },
          {
            name: 'search',
            in: 'query',
            type: 'string',
            description: 'Search by name, email, or phone',
          },
        ],
        responses: {
          200: {
            description: 'List of users retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/definitions/User' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 50 },
                        totalPages: { type: 'integer', example: 5 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User retrieved successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid user ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user by ID',
        description: 'Update user information',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID',
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              $ref: '#/definitions/UpdateUserRequest',
            },
          },
        ],
        responses: {
          200: {
            description: 'User updated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User updated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          409: {
            description: 'Email or phone already exists',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user by ID',
        description: 'Permanently delete a user from the system',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User deleted successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User deleted successfully' },
              },
            },
          },
          400: {
            description: 'Invalid user ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
    '/users/{id}/deactivate': {
      patch: {
        tags: ['Users'],
        summary: 'Deactivate user',
        description: 'Soft delete a user by setting isActive to false',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User deactivated successfully',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'User deactivated successfully' },
                data: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/definitions/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid user ID',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
          404: {
            description: 'User not found',
            schema: { $ref: '#/definitions/ErrorResponse' },
          },
        },
      },
    },
  },
  definitions: {
    User: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          description: 'User ID',
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
        },
        firstName: {
          type: 'string',
          description: 'User first name',
        },
        lastName: {
          type: 'string',
          description: 'User last name',
        },
        phone: {
          type: 'string',
          description: 'User phone number (Indian format)',
        },
        role: {
          type: 'string',
          enum: ['tenant', 'landlord', 'admin'],
          description: 'User role',
          default: 'tenant',
        },
        isEmailVerified: {
          type: 'boolean',
          description: 'Email verification status',
          default: false,
        },
        isPhoneVerified: {
          type: 'boolean',
          description: 'Phone verification status',
          default: false,
        },
        profilePicture: {
          type: 'string',
          description: 'Profile picture URL (Cloudinary)',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', description: 'Street address' },
            city: { type: 'string', description: 'City' },
            state: { type: 'string', description: 'State' },
            pincode: { type: 'string', description: '6-digit pincode' },
            country: { type: 'string', description: 'Country', default: 'India' },
          },
        },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          description: 'Date of birth',
        },
        aadhaarNumber: {
          type: 'string',
          description: '12-digit Aadhaar number',
        },
        panNumber: {
          type: 'string',
          description: 'PAN number',
        },
        isActive: {
          type: 'boolean',
          description: 'User active status',
          default: true,
        },
        lastLogin: {
          type: 'string',
          format: 'date-time',
          description: 'Last login timestamp',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Account creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
    CreateUserRequest: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
          example: 'john.doe@example.com',
        },
        password: {
          type: 'string',
          minLength: 8,
          description: 'Password (min 8 characters, must contain uppercase, lowercase, and number)',
          example: 'SecurePass123',
        },
        firstName: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'User first name',
          example: 'John',
        },
        lastName: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'User last name',
          example: 'Doe',
        },
        phone: {
          type: 'string',
          pattern: '^[6-9]\\d{9}$',
          description: 'Indian phone number (10 digits starting with 6-9)',
          example: '9876543210',
        },
        role: {
          type: 'string',
          enum: ['tenant', 'landlord', 'admin'],
          description: 'User role',
          default: 'tenant',
          example: 'tenant',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', pattern: '^\\d{6}$', example: '400001' },
            country: { type: 'string', default: 'India', example: 'India' },
          },
        },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          description: 'Date of birth',
          example: '1990-01-15T00:00:00.000Z',
        },
        aadhaarNumber: {
          type: 'string',
          pattern: '^\\d{12}$',
          description: '12-digit Aadhaar number',
          example: '123456789012',
        },
        panNumber: {
          type: 'string',
          pattern: '^[A-Z]{5}\\d{4}[A-Z]{1}$',
          description: 'PAN number',
          example: 'ABCDE1234F',
        },
      },
    },
    UpdateUserRequest: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
          example: 'john.doe@example.com',
        },
        password: {
          type: 'string',
          minLength: 8,
          description: 'Password (min 8 characters, must contain uppercase, lowercase, and number)',
          example: 'NewSecurePass123',
        },
        firstName: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'User first name',
          example: 'John',
        },
        lastName: {
          type: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'User last name',
          example: 'Doe',
        },
        phone: {
          type: 'string',
          pattern: '^[6-9]\\d{9}$',
          description: 'Indian phone number (10 digits starting with 6-9)',
          example: '9876543210',
        },
        role: {
          type: 'string',
          enum: ['tenant', 'landlord', 'admin'],
          description: 'User role',
          example: 'tenant',
        },
        isEmailVerified: {
          type: 'boolean',
          description: 'Email verification status',
          example: true,
        },
        isPhoneVerified: {
          type: 'boolean',
          description: 'Phone verification status',
          example: false,
        },
        profilePicture: {
          type: 'string',
          format: 'uri',
          description: 'Profile picture URL (Cloudinary)',
          example: 'https://res.cloudinary.com/example/image/upload/v1234567890/profile.jpg',
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: '123 Main Street' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', pattern: '^\\d{6}$', example: '400001' },
            country: { type: 'string', example: 'India' },
          },
        },
        dateOfBirth: {
          type: 'string',
          format: 'date-time',
          description: 'Date of birth',
          example: '1990-01-15T00:00:00.000Z',
        },
        aadhaarNumber: {
          type: 'string',
          pattern: '^\\d{12}$',
          description: '12-digit Aadhaar number',
          example: '123456789012',
        },
        panNumber: {
          type: 'string',
          pattern: '^[A-Z]{5}\\d{4}[A-Z]{1}$',
          description: 'PAN number',
          example: 'ABCDE1234F',
        },
        isActive: {
          type: 'boolean',
          description: 'User active status',
          example: true,
        },
      },
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              description: 'Validation errors (if applicable)',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  param: { type: 'string' },
                  location: { type: 'string' },
                },
              },
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)',
            },
          },
        },
      },
    },
    Error: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error type',
        },
        message: {
          type: 'string',
          description: 'Error message',
        },
      },
    },
  },
};

export default swaggerDocument;
