/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management and retrieval
 */

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a doctor
 *     description: Only admins can create other doctors.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               phone:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               doctorProfile:
 *                 type: object
 *                 properties:
 *                   specialisation:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   ratingCount:
 *                     type: number
 *                   address:
 *                     type: string
 *                   workingHours:
 *                     type: string
 *                   bio:
 *                     type: string
 *                   isListed:
 *                     type: boolean
 *                     default: false
 *                   supportedLanguages:
 *                     type: array
 *                     items:
 *                       type: string
 *                   phoneVisible:
 *                     type: boolean
 *                     default: false
 *             example:
 *               name: Dr. John Doe
 *               email: john.doe@example.com
 *               password: password1
 *               phone: "+1234567890"
 *               doctorProfile:
 *                 specialisation: Cardiologist
 *                 address: "123 Medical Street, City"
 *                 bio: "Experienced cardiologist with 10 years of practice"
 *                 isListed: true
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all doctors
 *     description: Only admins can retrieve all doctors.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Doctor name
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Doctor specialization
 *       - in: query
 *         name: isListed
 *         schema:
 *           type: boolean
 *         description: Filter by listed status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of doctors
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get a doctor
 *     description: Only admins can fetch doctors.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a doctor
 *     description: Only admins can update doctors.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               phone:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               doctorProfile:
 *                 type: object
 *                 properties:
 *                   specialisation:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   ratingCount:
 *                     type: number
 *                   address:
 *                     type: string
 *                   workingHours:
 *                     type: string
 *                   bio:
 *                     type: string
 *                   isListed:
 *                     type: boolean
 *                   supportedLanguages:
 *                     type: array
 *                     items:
 *                       type: string
 *                   phoneVisible:
 *                     type: boolean
 *             example:
 *               name: Dr. John Doe Updated
 *               doctorProfile:
 *                 specialisation: Neurologist
 *                 isListed: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a doctor
 *     description: Only admins can delete doctors.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
