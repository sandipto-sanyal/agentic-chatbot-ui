# File path
src\pages\Dashboard.tsx

# Overview
This page should render a dynamic dashboard

# Behavior
Following will be the behaviour of the page
- Give user a Select Dropdown to choose a database
- Once Database is chosen, do a `POST` call `http://{{VITE_HTTP_URL}}/api/get_dashboards` using following details
```json
{"database":"employees"}
```
- The response will be a
```python
class MetadataType(TypedDict):
    type: str
    database: str
    plotly_code:str
    
class SimilarDocumentType(TypedDict):
    _id: str
    created_at: str
    text:str
    metadata:MetadataType

List[SimilarDocumentType]
```
Sample Response structure:

```json
[{
    "_id": "6af6b2a4238e3ba5a3054f40",
    "created_at": "Fri, 13 Nov 2026 06:48:04 GMT",
    "metadata": {
        "dashboard_description": "Average current salary by current department, ordered highest to lowest. Includes department assignments and salary records marked active with to_date = '9999-01-01'.",
        "database": "employees",
        "plotly_code": "import React from 'react';\nimport Plot from 'react-plotly.js';\nconst SalaryDashboard = ({ departments }) => (\n  <Plot data={[{ x: departments.map(dept => dept.department), y: departments.map(dept => dept.average_salary), type: 'bar', marker: { color: 'blue' } }]} layout={{ title: 'Average Salary by Department', xaxis: { title: 'Department', categoryorder: 'total descending' }, yaxis: { title: 'Average Salary' } }} />\n);\nexport default SalaryDashboard;",
        "query": "WITH ActiveDeptEmp AS (SELECT dept_no, emp_no FROM dept_emp WHERE to_date = '9999-01-01'), ActiveSalaries AS (SELECT emp_no, salary FROM salaries WHERE to_date = '9999-01-01') SELECT d.dept_name AS department, ROUND(AVG(s.salary), 2) AS average_salary FROM departments d JOIN ActiveDeptEmp de ON de.dept_no = d.dept_no JOIN ActiveSalaries s ON s.emp_no = de.emp_no GROUP BY d.dept_no, d.dept_name ORDER BY average_salary DESC;",
        "update_timestamp": "2026-11-13 12:18:14"
    },
    "text": "Department wise Average Salaries"
}]
```
- Once User clicks on one of these dashboard cards, it will go inside and do a `POST` call `http://{{VITE_HTTP_URL}}/api/get_data` using following details
```json
{"database":"<database name chosen>",
"query":"<SQL for the given dashboard>"
}
```
- Once the data arrives.
 - Render the plotly code returned for the given data
 - Create an expandable to show first 20 rows of data in the UI

# Coding Guidelines
The code Must use
- Shadcn components wherever possible
- Axios to interact with HTTP endpoints 
- Must breakdown into different understandable functions