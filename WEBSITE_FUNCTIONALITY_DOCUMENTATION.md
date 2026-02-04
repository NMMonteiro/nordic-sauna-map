# Nordic Sauna Map - Website Functionality Documentation

**Project Overview**  
The Nordic Sauna Map is a comprehensive web platform dedicated to preserving and sharing Nordic sauna culture. The website combines an interactive map, educational resources, social media integration, and community features to create a rich digital experience for sauna enthusiasts and educators.

---

## 🌍 Core Features

### 1. Interactive Sauna Map
**Location:** Homepage & Main Navigation

The centerpiece of the website is an interactive map showcasing saunas across the Nordic region.

**Key Functionality:**
- **Interactive Map Display:** Powered by Leaflet.js, displaying saunas across Finland, Sweden, Norway, Denmark, and Iceland
- **Sauna Markers:** Each sauna is marked with a custom pin on the map
- **Click-to-View Details:** Clicking any marker opens a detailed modal with:
  - Sauna name and location
  - Historical information and cultural significance
  - High-quality images
  - Coordinates and address
  - Submission date and contributor information
- **Map Navigation:** Users can zoom, pan, and explore the entire Nordic region
- **Responsive Design:** Map adapts seamlessly to desktop, tablet, and mobile devices

**User Benefits:**
- Discover saunas across the Nordic countries
- Learn about sauna history and cultural heritage
- Explore geographical distribution of traditional saunas

---

### 2. Multi-Language Support
**Location:** Header (Language Selector)

The website supports three languages to serve the Nordic community.

**Supported Languages:**
- 🇬🇧 **English** - International audience
- 🇸🇪 **Swedish** (Svenska) - Swedish users
- 🇫🇮 **Finnish** (Suomi) - Finnish users

**Features:**
- Instant language switching via header dropdown
- All content, navigation, and UI elements translated
- Language preference persists across sessions
- Seamless translation of dynamic content

---

### 3. Education & Learning Resources
**Location:** Navigation → "Education"

A comprehensive educational section featuring pedagogical materials about Nordic sauna culture.

**Content Types:**
- **📄 Documents** - Research papers, guides, and educational texts
- **🎥 Videos** - Educational videos and documentaries
- **📊 Presentations** - PowerPoint presentations for classroom use
- **🔗 External Links** - Curated resources from trusted sources
- **📚 Lesson Plans** - Ready-to-use teaching materials

**Key Features:**
- **Smart Preview System:**
  - PDFs display in embedded viewer
  - Videos play directly in modal viewer
  - Presentations prompt download for optimal viewing
  - External links open in new tabs
- **Download Functionality:** All materials can be downloaded for offline use
- **Categorization:** Resources organized by type for easy browsing
- **Search & Filter:** Find specific materials quickly
- **Modal Viewer:** Full-screen viewing experience for all content types

**Special Handling:**
- Large PowerPoint files display a premium download interface (avoiding preview failures)
- Optimized file delivery through Supabase storage
- Responsive design for all device sizes

---

### 4. News & Social Media Hub
**Location:** Navigation → "News"

A dynamic social media feed aggregating content from all project social channels.

**Integrated Platforms:**
- 📸 **Instagram** - Visual updates and stories
- 📘 **Facebook** - Community posts and events
- 🎬 **YouTube** - Video content and tutorials

**Key Features:**
- **Unified Feed:** All social media posts in one place
- **Platform Filtering:** Filter posts by specific platform
  - "All Updates" - View everything
  - "Instagram" - Instagram posts only
  - "Facebook" - Facebook posts only
  - "YouTube" - YouTube videos only
- **Compact Card Design:**
  - Post thumbnail image
  - Platform icon with color-coding
  - User/account name
  - Relative timestamps ("2 days ago")
  - Truncated text preview (3 lines)
- **Load More:** Progressive loading (12 posts at a time)
- **Direct Links:** Click any post to view on original platform
- **Real-time Updates:** Fetches latest posts from Curator.io API

**Layout:**
- Clean, uniform grid layout (280px cards)
- Left-to-right, top-to-bottom flow
- Responsive grid adapts to screen size
- Premium hover effects and animations

---

### 5. Blog
**Location:** Navigation → "Blog"

A dedicated blog section for long-form content about sauna culture, project updates, and educational articles.

**Features:**
- Article listings with featured images
- Full article view with rich text formatting
- Categories and tags for organization
- Author information and publication dates
- Social sharing capabilities

---

### 6. About Page
**Location:** Navigation → "About"

Information about the Nordic Sauna Map project.

**Content Sections:**
- **Project Mission:** Goals and objectives of the initiative
- **Project Results:** Key achievements and outcomes presented in interactive cards:
  - Cultural preservation efforts
  - Educational impact
  - Community engagement metrics
  - Research contributions
- **Team Information:** (if applicable)
- **Project Timeline:** Development and milestones

**Design:**
- Premium card-based layout
- Interactive result cards with hover effects
- Multi-language support for all content

---

### 7. Partners Page
**Location:** Navigation → "Partners"

Showcase of project partners and collaborators.

**Featured Partners:**
- **Learnmera:** Educational technology partner
  - Company logo
  - Detailed description
  - Website link
  - Contact information
- **B-Creative:** Creative and design partner
  - Company logo
  - Detailed description
  - Website link
  - Contact information

**Design Features:**
- Professional partner cards
- High-quality logos
- Responsive layout
- Premium styling with shadows and animations

---

### 8. User Authentication & Membership
**Location:** Header → "Sign In" / User Profile

A comprehensive membership system for community engagement.

**User Roles:**
- **Public Users:** Can browse map and view content
- **Registered Members:** Can submit saunas and access exclusive features
- **Administrators:** Full access to admin panel and moderation tools

**Authentication Features:**
- Email/password registration and login
- Secure authentication via Supabase Auth
- Profile management
- Password reset functionality
- Session persistence

**Member Benefits:**
- Submit new saunas to the map
- Access to exclusive educational materials
- Community participation
- Personalized experience

---

### 9. Sauna Submission System
**Location:** Homepage → "Share Your Sauna" / "Add Your Sauna"

Community members can contribute to the map by submitting their own saunas.

**Submission Process:**
1. **User Authentication:** Must be logged in to submit
2. **Submission Form:**
   - Sauna name
   - Location (address or coordinates)
   - Country selection
   - Historical information
   - Cultural significance
   - Photo upload
   - Contact information
3. **Moderation Queue:** Submissions enter admin review
4. **Approval Process:** Admins review and approve/reject
5. **Publication:** Approved saunas appear on the map

**Quality Control:**
- Admin moderation prevents spam
- Photo validation
- Location verification
- Historical accuracy review

---

### 10. Admin Panel & Content Management System
**Location:** User Menu → "Admin Console" (Admins only)

A comprehensive administrative interface for complete platform management and content control.

**Access Control:**
- Only users with `is_admin = true` in the profiles table can access
- Secure role-based authentication
- Separate admin routes protected by authentication middleware
- Admin status verified on every request

---

#### A. **Admin Dashboard Overview**
The central hub for platform monitoring and quick access to all admin functions.

**Dashboard Metrics:**
- **Total Members:** Count of all registered users
- **Pending Submissions:** Number of sauna submissions awaiting review
- **Approved Saunas:** Total saunas published on the map
- **Recent Activity:** Latest user actions and submissions
- **Storage Usage:** Current file storage consumption
- **System Health:** Platform performance indicators

**Quick Actions:**
- Jump to pending submissions
- Access member management
- View recent blog posts
- Check learning materials
- Monitor user activity

---

#### B. **Learning Materials Management**
**Location:** Admin Panel → "Learning Materials"

Complete control over educational resources with advanced upload and management capabilities.

##### **Upload System**

**Supported File Types:**
1. **Documents (PDFs)**
   - Research papers
   - Educational guides
   - Study materials
   - Worksheets
   - Maximum size: 50MB per file
   - Automatic thumbnail generation
   - Full-text search indexing

2. **Videos**
   - MP4, MOV, AVI formats
   - Educational documentaries
   - Tutorial videos
   - Lecture recordings
   - Maximum size: 500MB per file
   - Automatic video compression
   - Thumbnail extraction from first frame

3. **Presentations**
   - PowerPoint (.pptx, .ppt)
   - Google Slides (via link)
   - Keynote (converted to PDF)
   - Maximum size: 100MB per file
   - Slide count validation
   - Preview generation for first 3 slides

4. **External Links**
   - YouTube videos
   - Vimeo content
   - External websites
   - Online resources
   - Link validation before saving
   - Automatic metadata fetching (title, description, thumbnail)

5. **Lesson Plans**
   - Structured teaching materials
   - PDF or Word documents
   - Curriculum-aligned content
   - Grade level specification
   - Subject categorization

**Upload Process:**
1. **Select Material Type:** Choose from dropdown (Document, Video, Presentation, Link, Lesson Plan)
2. **File Selection:**
   - Drag-and-drop interface
   - Or click to browse files
   - Multiple file upload supported
   - Real-time upload progress bar
3. **Metadata Entry:**
   - **Title:** Resource name (required, max 200 characters)
   - **Description:** Detailed explanation (required, max 1000 characters)
   - **Category:** Select from predefined categories
   - **Language:** EN, SV, or FI
   - **Grade Level:** (for lesson plans) Primary, Secondary, Higher Education
   - **Subject:** (for lesson plans) History, Culture, Science, etc.
   - **Tags:** Comma-separated keywords for searchability
   - **Visibility:** Public or Members-only
4. **File Processing:**
   - Automatic virus scanning
   - File type validation
   - Size limit enforcement
   - Thumbnail generation
   - Metadata extraction
5. **Preview & Confirm:**
   - Preview how resource will appear to users
   - Edit metadata if needed
   - Confirm upload
6. **Publication:**
   - Instant publication or schedule for later
   - Notification to subscribed users (optional)

**Management Features:**
- **Edit Materials:** Update title, description, category, tags
- **Replace Files:** Upload new version while maintaining URL
- **Delete Materials:** Soft delete with recovery option (30 days)
- **Bulk Actions:**
  - Select multiple materials
  - Bulk delete
  - Bulk category change
  - Bulk visibility toggle
- **Search & Filter:**
  - Search by title, description, tags
  - Filter by type, category, language
  - Sort by date, popularity, downloads
- **Analytics:**
  - View count per material
  - Download statistics
  - User engagement metrics
  - Popular resources dashboard

**File Storage:**
- Stored in Supabase Storage buckets
- Organized by type: `/documents`, `/videos`, `/presentations`
- CDN delivery for fast access worldwide
- Automatic backup to secondary storage
- Version control for file updates

---

#### C. **Blog Post Management & Moderation**
**Location:** Admin Panel → "Blog Posts"

Complete blog content management system with creation, editing, and moderation capabilities.

##### **Blog Post Creation**

**Post Editor Features:**
- **Rich Text Editor:**
  - WYSIWYG editing interface
  - Text formatting (bold, italic, underline, strikethrough)
  - Headings (H1-H6)
  - Lists (ordered, unordered)
  - Blockquotes
  - Code blocks with syntax highlighting
  - Tables
  - Horizontal rules
- **Media Insertion:**
  - Image upload with drag-and-drop
  - Image alignment (left, center, right)
  - Image captions and alt text
  - Video embeds (YouTube, Vimeo)
  - Audio embeds
  - File attachments
- **Link Management:**
  - Insert hyperlinks
  - Link to other blog posts
  - External link warning
  - Automatic link validation

**Post Metadata:**
1. **Title:** Post headline (required, max 200 characters)
2. **Slug:** URL-friendly version (auto-generated or custom)
3. **Excerpt:** Short summary (max 300 characters)
4. **Featured Image:**
   - Upload custom image
   - Recommended size: 1200x630px
   - Automatic resizing and optimization
   - Alt text for accessibility
5. **Author:** Select from admin users
6. **Categories:** Select one or more
   - Sauna Culture
   - History
   - Education
   - Community
   - Project Updates
   - Research
7. **Tags:** Comma-separated keywords
8. **Language:** EN, SV, or FI
9. **Publication Settings:**
   - **Status:** Draft, Pending Review, Published, Scheduled
   - **Publish Date:** Immediate or scheduled
   - **Visibility:** Public, Members-only, Private
10. **SEO Settings:**
    - Meta title
    - Meta description
    - Focus keyword
    - Social media preview

**Post Creation Workflow:**
1. **Draft Creation:**
   - Click "New Post"
   - Enter title and content
   - Add media and formatting
   - Save as draft (auto-save every 30 seconds)
2. **Preview:**
   - View how post will appear to users
   - Check mobile and desktop views
   - Test all links and media
3. **Review (if enabled):**
   - Submit for review
   - Another admin reviews content
   - Approve or request changes
4. **Publication:**
   - Publish immediately
   - Or schedule for specific date/time
   - Automatic social media sharing (optional)

##### **Blog Post Moderation**

**Moderation Queue:**
- View all posts pending review
- Filter by author, date, category
- Sort by submission date
- Bulk approve/reject actions

**Review Process:**
1. **Content Review:**
   - Read full post content
   - Check for accuracy and quality
   - Verify all links work
   - Ensure images load properly
   - Check for spelling/grammar
2. **Moderation Actions:**
   - **Approve:** Publish post immediately or schedule
   - **Request Changes:** Send back to author with comments
   - **Reject:** Decline post with reason
   - **Edit:** Make changes directly before publishing
3. **Moderation Comments:**
   - Leave notes for author
   - Internal comments (not visible to author)
   - Revision history tracking

**Published Post Management:**
- **Edit Posts:** Update content, metadata, images
- **Unpublish:** Remove from public view (keep in database)
- **Delete:** Soft delete with 30-day recovery
- **Duplicate:** Create copy for new post
- **View Analytics:**
  - Page views
  - Time on page
  - Social shares
  - Comments (if enabled)
  - User engagement

**Comment Moderation (if enabled):**
- Approve/reject user comments
- Mark as spam
- Ban abusive users
- Reply to comments as admin

---

#### D. **Sauna Submission System & Moderation**
**Location:** Admin Panel → "Sauna Submissions"

Comprehensive system for managing user-submitted saunas with detailed review and approval workflow.

##### **Submission Form (User-Facing)**

**Required Information:**
1. **Sauna Name:** Official or common name
2. **Location:**
   - **Address:** Street address or general location
   - **Coordinates:** Latitude and longitude (auto-filled from address)
   - **Country:** Finland, Sweden, Norway, Denmark, Iceland
   - **Region/Province:** Specific area
3. **Sauna Type:**
   - Traditional smoke sauna
   - Wood-heated sauna
   - Electric sauna
   - Public sauna
   - Private sauna
   - Historical sauna
4. **Historical Information:**
   - Year built (if known)
   - Historical significance
   - Cultural importance
   - Traditional practices
   - Stories and anecdotes
5. **Description:**
   - Physical description
   - Unique features
   - Current status (active, preserved, restored)
   - Accessibility information

**Media Upload:**
1. **Photos (Required - minimum 1, maximum 10):**
   - Accepted formats: JPG, PNG, HEIC
   - Maximum size per photo: 10MB
   - Automatic compression and optimization
   - Recommended: Exterior, interior, details, surroundings
   - Photo captions (optional)
   - Photographer credit (optional)
2. **Videos (Optional - maximum 2):**
   - Accepted formats: MP4, MOV
   - Maximum size: 100MB per video
   - Maximum length: 2 minutes
   - Automatic compression
   - Video descriptions
3. **Documents (Optional):**
   - Historical documents
   - Newspaper clippings
   - Research papers
   - Maximum 5 documents
   - PDF format preferred

**Submitter Information:**
- Name (auto-filled from profile)
- Email (auto-filled from profile)
- Relationship to sauna (Owner, Visitor, Researcher, etc.)
- Permission to publish (checkbox required)
- Contact for follow-up questions (optional)

**Submission Process:**
1. User clicks "Share Your Sauna" (must be logged in)
2. Fills out comprehensive form
3. Uploads media files with progress indicators
4. Reviews submission preview
5. Agrees to terms and conditions
6. Submits for review
7. Receives confirmation email
8. Gets notification when reviewed

##### **Admin Moderation Interface**

**Pending Submissions Dashboard:**
- List view of all pending submissions
- Thumbnail preview
- Submission date
- Submitter name
- Quick actions (Approve, Reject, View Details)
- Filter by country, date, type
- Sort by date, submitter, location

**Detailed Review Page:**

**Submission Information Display:**
- All submitted data in organized sections
- Photo gallery with full-size preview
- Video player for submitted videos
- Document viewer for attachments
- Map preview showing exact location
- Submitter profile and history

**Verification Tools:**
1. **Location Verification:**
   - Interactive map to verify coordinates
   - Adjust marker position if needed
   - Street view integration (if available)
   - Reverse geocoding to confirm address
2. **Photo Verification:**
   - Check image quality
   - Verify authenticity (reverse image search)
   - Ensure appropriate content
   - Crop or rotate if needed
3. **Information Verification:**
   - Cross-reference historical facts
   - Check for duplicate submissions
   - Verify sauna still exists
   - Confirm accessibility information

**Moderation Actions:**

1. **Approve Submission:**
   - Click "Approve"
   - Sauna immediately added to map
   - Submitter receives approval email
   - Sauna appears in public map view
   - Submitter credited on sauna page

2. **Request More Information:**
   - Select specific fields needing clarification
   - Write message to submitter
   - Set deadline for response
   - Submission returns to submitter's dashboard
   - Auto-reject if no response in 30 days

3. **Edit Before Approval:**
   - Admin can make minor corrections
   - Fix typos or formatting
   - Adjust coordinates
   - Crop photos
   - Add missing information
   - Changes logged in audit trail

4. **Reject Submission:**
   - Select rejection reason:
     - Duplicate submission
     - Insufficient information
     - Poor quality photos
     - Not a sauna
     - Inappropriate content
     - Location cannot be verified
   - Write detailed explanation
   - Suggest improvements for resubmission
   - Submitter receives rejection email
   - Option to resubmit after corrections

**Bulk Moderation:**
- Select multiple submissions
- Bulk approve (if all meet criteria)
- Bulk reject with same reason
- Assign to specific admin for review
- Export submission data

**Moderation History:**
- View all past decisions
- Filter by moderator, action, date
- Audit trail for accountability
- Statistics on approval/rejection rates

---

#### E. **User Management**
**Location:** Admin Panel → "Members"

Comprehensive user account management and community moderation tools.

**User Database View:**
- **List View:**
  - All registered users in table format
  - Columns: Name, Email, Join Date, Role, Status, Last Active
  - Search by name, email, or ID
  - Filter by role, status, join date
  - Sort by any column
  - Pagination (50 users per page)
  - Export to CSV

**User Profile Details:**
For each user, admins can view:
1. **Account Information:**
   - Full name
   - Email address
   - Username (if applicable)
   - Registration date
   - Last login date
   - Account status (Active, Suspended, Banned)
   - Email verification status
2. **User Activity:**
   - Number of sauna submissions
   - Number of approved saunas
   - Blog comments (if enabled)
   - Downloads of learning materials
   - Login history
   - Activity timeline
3. **Permissions & Roles:**
   - Current role (User, Member, Admin)
   - Custom permissions
   - Access level
   - Membership tier (if applicable)

**User Management Actions:**

1. **Edit User Profile:**
   - Update name, email
   - Change username
   - Reset password (send reset link)
   - Update profile photo
   - Edit bio/description

2. **Role Management:**
   - Promote to Admin
   - Demote from Admin
   - Grant special permissions
   - Revoke permissions
   - Create custom roles

3. **Account Status:**
   - **Activate:** Enable suspended account
   - **Suspend:** Temporarily disable account
     - User cannot log in
     - Content remains visible
     - Can be reactivated
   - **Ban:** Permanently disable account
     - User cannot log in
     - Option to hide all user content
     - Requires reason and documentation
   - **Delete:** Permanently remove account
     - GDPR-compliant data deletion
     - Option to keep or remove user content
     - Irreversible action (requires confirmation)

4. **Communication:**
   - Send email to user
   - Send system notification
   - Add admin notes (internal only)
   - View message history

**Bulk User Actions:**
- Select multiple users
- Bulk email
- Bulk role change
- Bulk export data
- Bulk delete (with safeguards)

**User Analytics:**
- Total registered users
- New registrations (daily, weekly, monthly)
- Active users
- User retention rates
- Geographic distribution
- Most active contributors
- User engagement metrics

**Spam & Abuse Prevention:**
- Flag suspicious accounts
- View reported users
- Check for duplicate accounts
- IP address tracking
- Email domain blocking
- Automated spam detection

---

#### F. **Sauna Map Management**
**Location:** Admin Panel → "Sauna Map"

Direct management of all approved saunas on the interactive map.

**Map Management Interface:**
- Interactive map view showing all saunas
- List view with search and filters
- Dual-pane view (map + list)

**Sauna Entry Management:**

1. **View All Saunas:**
   - See all approved saunas
   - Filter by country, type, date added
   - Search by name or location
   - Sort by various criteria

2. **Edit Sauna Information:**
   - Update any field
   - Add/remove photos
   - Correct coordinates
   - Update historical information
   - Add admin notes

3. **Photo Management:**
   - Upload additional photos
   - Delete inappropriate photos
   - Reorder photo gallery
   - Set featured image
   - Edit captions

4. **Location Adjustment:**
   - Drag marker to new position
   - Enter exact coordinates
   - Update address
   - Verify on satellite view

5. **Visibility Control:**
   - Publish/unpublish sauna
   - Feature on homepage
   - Mark as "Editor's Pick"
   - Set visibility (Public, Members-only)

6. **Delete Sauna:**
   - Soft delete (can be restored)
   - Hard delete (permanent)
   - Requires confirmation
   - Notification to original submitter

**Batch Operations:**
- Select multiple saunas
- Bulk edit categories
- Bulk visibility changes
- Export selected data
- Generate reports

---

#### G. **News & Social Media Management**
**Location:** Admin Panel → "News Feed"

Management of social media integration and news content.

**Social Media Feed Configuration:**
1. **Platform Connections:**
   - Instagram account linking
   - Facebook page integration
   - YouTube channel connection
   - API credentials management
   - Curator.io feed configuration

2. **Feed Settings:**
   - Number of posts to display
   - Update frequency
   - Post filtering rules
   - Content moderation settings
   - Hashtag filtering

3. **Content Moderation:**
   - Hide specific posts
   - Block certain hashtags
   - Filter inappropriate content
   - Manual post approval (optional)

**Manual News Posts:**
- Create custom news posts
- Add images and videos
- Schedule publication
- Pin important announcements
- Archive old news

---

#### H. **Analytics & Reports**
**Location:** Admin Panel → "Analytics"

Comprehensive platform analytics and reporting tools.

**Available Reports:**
1. **User Analytics:**
   - Registration trends
   - Active users
   - User demographics
   - Engagement metrics

2. **Content Analytics:**
   - Most viewed saunas
   - Popular learning materials
   - Blog post performance
   - Download statistics

3. **Submission Analytics:**
   - Submission rates
   - Approval/rejection rates
   - Average review time
   - Submitter statistics

4. **Geographic Analytics:**
   - Sauna distribution by country
   - User distribution
   - Popular regions

5. **Custom Reports:**
   - Date range selection
   - Custom metrics
   - Export to PDF/Excel
   - Scheduled reports

---

#### I. **System Settings**
**Location:** Admin Panel → "Settings"

Platform-wide configuration and settings management.

**General Settings:**
- Site name and description
- Contact information
- Social media links
- Default language
- Timezone

**Email Settings:**
- SMTP configuration
- Email templates
- Notification preferences
- Automated emails

**Security Settings:**
- Password requirements
- Two-factor authentication
- Session timeout
- IP whitelist/blacklist
- API access control

**Storage Settings:**
- File upload limits
- Allowed file types
- Storage quota management
- CDN configuration

**Maintenance Mode:**
- Enable/disable site
- Maintenance message
- Whitelist admin IPs
- Scheduled maintenance

---

## 🎨 Design & User Experience

### Visual Design
- **Premium Aesthetic:** Modern, clean design with Nordic-inspired color palette
- **Color Scheme:**
  - Primary: Sky blue (#0EA5E9)
  - Secondary: Nordic lake blue
  - Accents: Frost white, slate grays
- **Typography:** Bold, uppercase headings with clean sans-serif body text
- **Animations:** Smooth transitions, hover effects, and micro-interactions

### Responsive Design
- **Mobile-First:** Optimized for smartphones and tablets
- **Breakpoints:** Adapts to all screen sizes
- **Touch-Friendly:** Large tap targets and swipe gestures
- **Performance:** Fast loading on all devices

### Accessibility
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast ratios
- Focus indicators

---

## 🔧 Technical Infrastructure

### Frontend Technology
- **Framework:** React with TypeScript
- **Routing:** React Router for navigation
- **Styling:** Tailwind CSS for responsive design
- **Maps:** Leaflet.js for interactive mapping
- **Icons:** Font Awesome & Material Symbols

### Backend & Database
- **Backend:** Supabase (PostgreSQL database)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage for images and files
- **API:** RESTful API for data operations

### External Integrations
- **Social Media:** Curator.io API for social feed aggregation
- **File Previews:** Google Docs Viewer for PDFs
- **Analytics:** (if implemented)

### Hosting & Deployment
- **Hosting:** Vercel (or similar)
- **Domain:** Custom domain configured
- **SSL:** HTTPS encryption
- **CDN:** Global content delivery

---

## 📊 Database Schema

### Key Tables:
1. **saunas** - All sauna entries with location and details
2. **profiles** - User profiles and membership data
3. **learning_materials** - Educational resources and files
4. **blog_posts** - Blog articles and content
5. **submissions** - Pending sauna submissions for moderation

### Data Security:
- Row-level security policies
- Encrypted sensitive data
- Regular backups
- GDPR compliance

---

## 🌐 Multi-Language Content

All user-facing content is available in three languages:

### Translated Elements:
- Navigation menus
- Page titles and headings
- Button labels
- Form fields and validation messages
- Educational content
- Blog posts
- Error messages
- Success notifications

### Language Implementation:
- Translation objects in components
- Dynamic content switching
- Consistent terminology across languages
- Native speaker reviewed translations

---

## 📱 Key User Journeys

### Journey 1: Discovering Saunas
1. User lands on homepage
2. Sees interactive map with sauna markers
3. Clicks on a marker to view details
4. Reads about sauna history and culture
5. Explores more saunas on the map

### Journey 2: Accessing Educational Resources
1. User navigates to Education page
2. Browses available materials by type
3. Clicks on a resource to preview
4. Downloads materials for offline use
5. Uses materials in classroom or personal study

### Journey 3: Following Social Updates
1. User visits News page
2. Views unified social media feed
3. Filters by preferred platform (e.g., Instagram)
4. Clicks on post to view on original platform
5. Loads more posts to see additional content

### Journey 4: Contributing a Sauna
1. User creates account / logs in
2. Clicks "Share Your Sauna" button
3. Fills out submission form with details
4. Uploads photos
5. Submits for review
6. Receives notification when approved
7. Sees their sauna on the map

### Journey 5: Admin Moderation
1. Admin logs in
2. Accesses Admin Console
3. Reviews pending submissions
4. Checks submission quality and accuracy
5. Approves or rejects submissions
6. Approved saunas automatically appear on map

---

## 🎯 Project Goals & Impact

### Educational Impact
- Preserve Nordic sauna cultural heritage
- Provide free educational resources to teachers
- Promote understanding of sauna traditions
- Support cultural education in schools

### Community Engagement
- Build a community of sauna enthusiasts
- Enable user contributions to the map
- Share stories and experiences
- Connect people across Nordic countries

### Cultural Preservation
- Document traditional saunas before they're lost
- Record historical information
- Create a digital archive
- Promote cultural awareness

---

## 🚀 Future Enhancements (Potential)

### Possible Future Features:
- **User Reviews:** Allow members to review and rate saunas
- **Sauna Routes:** Create curated sauna tours
- **Events Calendar:** Sauna-related events and gatherings
- **Mobile App:** Native iOS/Android applications
- **Virtual Tours:** 360° photos and virtual experiences
- **Advanced Search:** Filter saunas by features, region, type
- **Favorites:** Save favorite saunas to personal list
- **Social Features:** User profiles, following, comments
- **Gamification:** Badges for visiting saunas, contributions
- **API Access:** Public API for developers

---

## 📞 Support & Maintenance

### Content Management
- Admins can update all content through the admin panel
- Educational materials managed via Supabase storage
- Blog posts created and edited through CMS
- Social media feed updates automatically

### Technical Support
- Regular updates and security patches
- Performance monitoring
- Bug fixes and improvements
- Feature enhancements based on user feedback

### User Support
- Contact information available on website
- FAQ section (if implemented)
- Email support for technical issues
- Community guidelines and help documentation

---

## 📈 Analytics & Metrics

### Tracked Metrics (if implemented):
- Page views and user sessions
- Most viewed saunas
- Popular educational resources
- User engagement rates
- Geographic distribution of users
- Submission rates
- Social media engagement

---

## ✅ Quality Assurance

### Testing Coverage:
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness testing
- Performance optimization
- Security audits
- Accessibility compliance
- User acceptance testing

### Performance Optimization:
- Image optimization and lazy loading
- Code splitting and bundling
- CDN delivery
- Caching strategies
- Database query optimization

---

## 📋 Summary

The Nordic Sauna Map is a comprehensive digital platform that successfully combines:
- **Interactive mapping** for sauna discovery
- **Educational resources** for learning and teaching
- **Social media integration** for community engagement
- **User contributions** for collaborative content creation
- **Multi-language support** for Nordic accessibility
- **Premium design** for exceptional user experience

The platform serves educators, students, sauna enthusiasts, and cultural preservationists, providing a valuable resource for understanding and celebrating Nordic sauna heritage.

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Platform:** Nordic Sauna Map (nordic-sauna-map)  
**Contact:** [Your Contact Information]
