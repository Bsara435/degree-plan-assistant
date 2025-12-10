# Admin Analytics Dashboard Documentation

**Date**: December 2024  
**Location**: `/admin/students`  
**Purpose**: Comprehensive analytics dashboard for student data visualization and insights

---

## 📊 Overview

The Admin Analytics Dashboard provides administrators with visual insights into student data, mentoring assignments, and growth trends. It replaces the previous placeholder students page with an interactive analytics interface featuring multiple chart types and key metrics.

---

## 🎯 Features

### Key Metrics Cards
- **Total Students**: Overall count of registered students
- **With Mentors**: Number and percentage of students assigned mentors
- **With Advisors**: Number and percentage of students assigned advisors
- **Unassigned**: Count of students needing mentor/advisor assignments

### Analytics Charts

1. **Students by School** (Pie Chart)
   - Distribution across SSE, SHAS, and SBA
   - Visual representation with color-coded segments
   - Percentage labels for each school

2. **Students by Classification** (Bar Chart)
   - Breakdown by Freshman, Sophomore, Junior, Senior
   - Ordered chronologically
   - Easy comparison of class sizes

3. **Mentorship Status** (Pie Chart)
   - Students with mentors vs. without mentors
   - Percentage breakdown
   - Quick identification of unassigned students

4. **Advisor Status** (Pie Chart)
   - Students with advisors vs. without advisors
   - Percentage breakdown
   - Highlights students needing advisor assignment

5. **Top 10 Majors** (Horizontal Bar Chart)
   - Most popular majors by student count
   - Sorted by popularity
   - Limited to top 10 for readability

6. **Student Growth Over Time** (Line Chart)
   - Monthly registration trends
   - Shows new student registrations by month
   - Helps identify growth patterns

---

## 🛠️ Technical Implementation

### Technology Stack

- **Framework**: Next.js 15.5.5 (React 19)
- **Charting Library**: Recharts v2.12.7
- **Icons**: Phosphor Icons
- **Styling**: Tailwind CSS
- **API Client**: Axios

### File Structure

```
frontend/
├── app/
│   └── admin/
│       └── students/
│           └── page.tsx          # Analytics dashboard component
├── components/
│   └── layout/
│       ├── AdminHeader.tsx       # Top navigation
│       └── AdminBottomNav.tsx    # Bottom navigation
└── lib/
    └── api.ts                    # API client with adminAPI
```

### Dependencies

```json
{
  "recharts": "^2.12.7",
  "@phosphor-icons/react": "^2.1.7",
  "axios": "^1.12.2"
}
```

---

## 📡 API Integration

### Endpoint Used

**GET** `/api/admin/students`

**Authentication**: Required (Admin role)  
**Headers**: `Authorization: Bearer <token>`

**Response Structure**:
```json
{
  "success": true,
  "students": [
    {
      "_id": "string",
      "fullName": "string",
      "email": "string",
      "school": "SSE" | "SHAS" | "SBA" | null,
      "major": "string" | null,
      "classification": "Freshman" | "Sophomore" | "Junior" | "Senior" | null,
      "mentor": {
        "_id": "string",
        "fullName": "string",
        "email": "string",
        "role": "peer_mentor"
      } | null,
      "advisor": {
        "_id": "string",
        "fullName": "string",
        "email": "string",
        "role": "fye_teacher" | "peer_mentor" | "admin"
      } | null,
      "createdAt": "ISO date string"
    }
  ]
}
```

### API Client Function

```typescript
// frontend/lib/api.ts
adminAPI.listStudents: async () => {
  const response = await api.get("/admin/students");
  return response.data;
}
```

---

## 📈 Data Processing

### Analytics Calculations

The dashboard processes raw student data client-side to generate analytics:

#### 1. School Distribution
```typescript
const bySchool = students.reduce((acc, student) => {
  const school = student.school || "Unknown";
  acc[school] = (acc[school] || 0) + 1;
  return acc;
}, {});
```

#### 2. Classification Distribution
```typescript
const byClassification = students.reduce((acc, student) => {
  const classification = student.classification || "Unknown";
  acc[classification] = (acc[classification] || 0) + 1;
  return acc;
}, {});
```

#### 3. Major Distribution
```typescript
const byMajor = students.reduce((acc, student) => {
  const major = student.major || "Unknown";
  acc[major] = (acc[major] || 0) + 1;
  return acc;
}, {});
```

#### 4. Mentorship Status
```typescript
const withMentor = students.filter((s) => s.mentor).length;
const withoutMentor = total - withMentor;
```

#### 5. Advisor Status
```typescript
const withAdvisor = students.filter((s) => s.advisor).length;
const withoutAdvisor = total - withAdvisor;
```

#### 6. Growth Over Time
```typescript
const byMonth = students.reduce((acc, student) => {
  if (student.createdAt) {
    const date = new Date(student.createdAt);
    const month = date.toLocaleDateString("en-US", { 
      month: "short", 
      year: "numeric" 
    });
    acc[month] = (acc[month] || 0) + 1;
  }
  return acc;
}, {});
```

---

## 🎨 Chart Components

### Pie Charts
- **Library**: Recharts `PieChart` and `Pie`
- **Features**: 
  - Custom colors from COLORS array
  - Percentage labels
  - Interactive tooltips
  - Responsive sizing

### Bar Charts
- **Library**: Recharts `BarChart` and `Bar`
- **Features**:
  - Vertical and horizontal layouts
  - Rounded corners
  - Grid lines
  - Custom colors

### Line Chart
- **Library**: Recharts `LineChart` and `Line`
- **Features**:
  - Monotone curve type
  - Custom stroke width
  - Data points (dots)
  - Time-series visualization

---

## 🎯 User Experience

### Loading States
- Spinner animation during data fetch
- "Loading analytics..." message
- Prevents interaction during load

### Empty States
- "No data available" message for charts
- Helpful guidance when no students exist
- Graceful handling of missing data

### Responsive Design
- Mobile-friendly layout
- Grid system adapts to screen size
- Charts scale responsively
- Touch-friendly interactions

### Color Scheme
```typescript
const COLORS = [
  "#0345A0",  // Primary Blue
  "#FF8F6B",  // Orange
  "#54C1A9",  // Teal
  "#6B46C1",  // Purple
  "#F59E0B",  // Amber
  "#EF4444"   // Red
];
```

---

## 🔐 Security & Access Control

### Authentication
- Requires valid JWT token
- Admin role verification
- Automatic redirect if unauthorized

### Authorization Flow
```typescript
1. Check for token in localStorage
2. Verify user role is "admin"
3. Redirect to login if unauthorized
4. Fetch data only after authorization
```

---

## 📱 Navigation

### Header
- **Component**: `AdminHeader`
- **Features**: Logo, branding, logout button
- **Sticky**: Yes (top of page)

### Bottom Navigation
- **Component**: `AdminBottomNav`
- **Items**: Dashboard, Students, Mentors, Settings
- **Sticky**: Yes (bottom of page)
- **Active State**: Highlights current page

---

## 🚀 Usage Guide

### Accessing the Dashboard

1. **Login as Admin**
   - Navigate to `/admin/login`
   - Use admin credentials (admin/Test1234)
   - Complete 2-step verification

2. **Navigate to Analytics**
   - Click "Students" in bottom navigation
   - Or visit `/admin/students` directly

3. **View Analytics**
   - Metrics cards show at the top
   - Scroll to see all charts
   - Hover over charts for detailed tooltips

### Interpreting Charts

#### School Distribution
- Shows which schools have the most students
- Helps identify enrollment patterns
- Useful for resource allocation

#### Classification Breakdown
- Identifies class size distribution
- Helps plan for graduation cycles
- Shows student progression

#### Mentorship/Advisor Status
- Quickly identifies students needing assignments
- Shows coverage percentages
- Highlights areas needing attention

#### Top Majors
- Identifies popular programs
- Helps with curriculum planning
- Shows student interest trends

#### Growth Over Time
- Tracks registration trends
- Identifies peak registration periods
- Helps with capacity planning

---

## 🔧 Customization

### Adding New Charts

1. **Calculate Data**
   ```typescript
   const newData = students.reduce((acc, student) => {
     // Your calculation logic
   }, {});
   ```

2. **Add Chart Component**
   ```tsx
   <ChartCard title="New Chart">
     <ResponsiveContainer width="100%" height={300}>
       <YourChart data={newData}>
         {/* Chart components */}
       </YourChart>
     </ResponsiveContainer>
   </ChartCard>
   ```

3. **Update Grid Layout**
   - Add to existing grid or create new section

### Modifying Colors

Update the `COLORS` array:
```typescript
const COLORS = ["#YOUR_COLOR_1", "#YOUR_COLOR_2", ...];
```

### Changing Chart Types

Replace chart components:
- `PieChart` → `BarChart` for different visualization
- Adjust `ResponsiveContainer` height as needed
- Update tooltip and legend configurations

---

## 🐛 Troubleshooting

### Common Issues

#### Charts Not Displaying
- **Cause**: Recharts not installed
- **Solution**: Run `npm install recharts` in frontend directory
- **Verify**: Check `package.json` for recharts dependency

#### No Data Showing
- **Cause**: No students in database or API error
- **Solution**: 
  - Check browser console for errors
  - Verify API endpoint is accessible
  - Ensure students exist in database

#### Build Errors
- **Cause**: Module resolution issues
- **Solution**:
  - Clear `.next` folder: `rm -rf .next`
  - Reinstall dependencies: `npm install`
  - Restart dev server

#### Authorization Errors
- **Cause**: Invalid or expired token
- **Solution**: 
  - Logout and login again
  - Verify admin role in database
  - Check token expiration

---

## 📊 Performance Considerations

### Data Processing
- **Client-side calculation**: All analytics computed in browser
- **Memoization**: Uses `useMemo` to prevent recalculation
- **Efficient**: Only recalculates when student data changes

### Chart Rendering
- **Responsive**: Charts adapt to container size
- **Lazy loading**: Charts render only when visible
- **Optimized**: Recharts handles rendering optimization

### API Calls
- **Single request**: Fetches all students once
- **Caching**: Consider adding React Query for caching
- **Pagination**: Not implemented (loads all students)

---

## 🔮 Future Enhancements

### Potential Improvements

1. **Real-time Updates**
   - WebSocket integration
   - Auto-refresh functionality
   - Live data updates

2. **Export Functionality**
   - Export charts as images
   - Download data as CSV
   - Generate PDF reports

3. **Advanced Filtering**
   - Filter by date range
   - Filter by school/major
   - Custom date ranges for growth chart

4. **Additional Metrics**
   - Average time to mentor assignment
   - Student retention rates
   - Mentor-to-student ratios

5. **Interactive Features**
   - Click charts to drill down
   - Detailed student lists
   - Filter students by chart selection

6. **Performance Optimization**
   - Server-side analytics calculation
   - Caching with React Query
   - Pagination for large datasets

7. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode

---

## 📝 Code Examples

### Adding a New Metric Card

```tsx
<MetricCard
  title="New Metric"
  value={calculatedValue}
  subtitle="Additional info"
  icon={<YourIcon size={24} weight="duotone" />}
  color="from-[#COLOR1] to-[#COLOR2]"
/>
```

### Creating a Custom Chart

```tsx
<ChartCard title="Custom Chart">
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={yourData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#0345A0" />
    </BarChart>
  </ResponsiveContainer>
</ChartCard>
```

---

## 🔗 Related Documentation

- [Admin Dashboard](./ROLES-ANALYSIS.md) - General admin features
- [API Documentation](./backend%20progress/AUTH-SUMMARY.md) - Authentication and API details
- [Frontend Setup](./UI&Frontend/SETUP-GUIDE.md) - Frontend configuration

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify API endpoints are working
3. Check network tab for failed requests
4. Review authentication status

---

## ✅ Testing Checklist

- [x] Charts render correctly
- [x] Data calculations are accurate
- [x] Loading states work
- [x] Empty states display properly
- [x] Responsive design works
- [x] Navigation functions correctly
- [x] Authentication enforced
- [x] Error handling implemented

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

