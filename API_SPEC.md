# Sample Responses for the websocket connection
Websocket - http://127.0.0.1:5000/ws

## Sample Query
```json
{
    "task": "Department wise Average Salaries"
}
```

## Sample Flow Responses
This denotes the pings Websocket server is making to the client for a sample query during ws.send method.
```json
[
    {"type_": "ProgressMessage", "toolName": "get_database_schema", "step": 0, "content": "Running get_database_schema"},

    {"type_": "ToolMessage", "toolName": "get_database_schema", "step": 0, "content": "CREATE TABLE `departments` (\n  `dept_no` char(4) NOT NULL,\n  `dept_name` varchar(40) NOT NULL,\n  PRIMARY KEY (`dept_no`),\n  UNIQUE KEY `dept_name` (`dept_name`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci\n\nCREATE TABLE `dept_emp` (\n  `emp_no` int NOT NULL,\n  `dept_no` char(4) NOT NULL,\n  `from_date` date NOT NULL,\n  `to_date` date NOT NULL,\n  PRIMARY KEY (`emp_no`,`dept_no`),\n  KEY `dept_no` (`dept_no`),\n  CONSTRAINT `dept_emp_ibfk_1` FOREIGN KEY (`emp_no`) REFERENCES `employees` (`emp_no`) ON DELETE CASCADE,\n  CONSTRAINT `dept_emp_ibfk_2` FOREIGN KEY (`dept_no`) REFERENCES `departments` (`dept_no`) ON DELETE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci\n\nCREATE TABLE `dept_manager` (\n  `emp_no` int NOT NULL,\n  `dept_no` char(4) NOT NULL,\n  `from_date` date NOT NULL,\n  `to_date` date NOT NULL,\n  PRIMARY KEY (`emp_no`,`dept_no`),\n  KEY `dept_no` (`dept_no`),\n  CONSTRAINT `dept_manager_ibfk_1` FOREIGN KEY (`emp_no`) REFERENCES `employees` (`emp_no`) ON DELETE CASCADE,\n  CONSTRAINT `dept_manager_ibfk_2` FOREIGN KEY (`dept_no`) REFERENCES `departments` (`dept_no`) ON DELETE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci\n\nCREATE TABLE `employees` (\n  `emp_no` int NOT NULL,\n  `birth_date` date NOT NULL,\n  `first_name` varchar(14) NOT NULL,\n  `last_name` varchar(16) NOT NULL,\n  `gender` enum('M','F') NOT NULL,\n  `hire_date` date NOT NULL,\n  PRIMARY KEY (`emp_no`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci\n\nCREATE TABLE `salaries` (\n  `emp_no` int NOT NULL,\n  `salary` int NOT NULL,\n  `from_date` date NOT NULL,\n  `to_date` date NOT NULL,\n  PRIMARY KEY (`emp_no`,`from_date`),\n  CONSTRAINT `salaries_ibfk_1` FOREIGN KEY (`emp_no`) REFERENCES `employees` (`emp_no`) ON DELETE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci\n\nCREATE TABLE `titles` (\n  `emp_no` int NOT NULL,\n  `title` varchar(50) NOT NULL,\n  `from_date` date NOT NULL,\n  `to_date` date DEFAULT NULL,\n  PRIMARY KEY (`emp_no`,`title`,`from_date`),\n  CONSTRAINT `titles_ibfk_1` FOREIGN KEY (`emp_no`) REFERENCES `employees` (`emp_no`) ON DELETE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci"},

    {"type_": "ProgressMessage", "toolName": "simplify_query", "step": 0, "content": "Running simplify_query"},

    {"type_": "ToolMessage", "toolName": "simplify_query", "step": 0, "content": "You can simplify the given query using Common Table Expressions (CTEs) as follows:\n\n```sql\nWITH DepartmentSalaries AS (\n    SELECT department, salary\n    FROM employees\n)\n\nSELECT department, AVG(salary) AS average_salary\nFROM DepartmentSalaries\nGROUP BY department;\n```\n\nIn this simplified version, the CTE `DepartmentSalaries` retrieves the department and salary from the `employees` table. The main query then calculates the average salary for each department based on this CTE."},

    {"type_": "ProgressMessage", "toolName": "query_runner", "step": 1, "content": "Running query_runner"},

    {"type_": "SubagentMessage", "toolname": "query_runner", "step": null, "content": "Running query: WITH DepartmentSalaries AS (\n    SELECT d.dept_name AS department, s.salary\n    FROM dept_emp de\n    JOIN departments d ON de.dept_no = d.dept_no\n    JOIN salaries s ON de.emp_no = s.emp_no\n)\n\nSELECT department, AVG(salary) AS average_salary\nFROM DepartmentSalaries\nGROUP BY department;"},

    {"type_": "SubagentMessage", "toolname": "query_runner", "step": null, "content": "Fetched: 9 results"},

    {"type_": "ToolMessage", "toolName": "query_runner", "step": 1, "content": "| department         |   average_salary |\n|:-------------------|-----------------:|\n| Customer Service   |          58770.4 |\n| Development        |          59478.9 |\n| Finance            |          70489.4 |\n| Human Resources    |          55574.9 |\n| Marketing          |          71913.2 |\n| Production         |          59605.5 |\n| Quality Management |          57251.3 |\n| Research           |          59665.2 |\n| Sales              |          80667.6 |"},

    {"type_": "OrchestratorMessage", "content": "Here are the average salaries department-wise:\n\n| Department         | Average Salary |\n|:-------------------|----------------:|\n| Customer Service   |          58,770.4 |\n| Development        |          59,478.9 |\n| Finance            |          70,489.4 |\n| Human Resources    |          55,574.9 |\n| Marketing          |          71,913.2 |\n| Production         |          59,605.5 |\n| Quality Management |          57,251.3 |\n| Research           |          59,665.2 |\n| Sales              |          80,667.6 |", "step": 2, "toolName": null}
]
```