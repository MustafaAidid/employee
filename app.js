const inquirer = require("inquirer")
const mysql = require("mysql")
const cTable = require('console.table');

///******** Connect to DB server *****/
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "user",
    password: "password",
    database: "employee_DB"
  });

connection.connect(function(err) {
    if (err) throw err
    console.log("Connected to DB server")
    runPrompt()
});


//***** start and run prompt****/
 async function runPrompt() {

    const options =
      {
      type: "list",
      message: "What would you like to do?",
      name: "choice",
      choices: [
                "View All Employees?", 
                "View All Employee's By Roles?",
                "View all Emplyees By Deparments", 
                "Update Employee",
                "Add Employee?",
                "Add Role?",
                "Add Department?"
              ]
      } 
      
    const action = await inquirer.prompt(options) 

    switch (action.choice){
      case "View All Employees?":
        viewAllEmployees();
      break;

      case "View All Employee's By Roles?":
        viewAllRoles();
      break;
      case "View all Emplyees By Deparments":
        viewAllDepartments();
      break; 
    
      case "Add Employee?":
          addEmployee();
        break;

      case "Update Employee":
          updateEmployee();
        break;

      case "Add Role?":
          addRole();
        break;

      case "Add Department?":
          addDepartment();
        break;

    }

}


//***** Controllers for server query****/
function viewAllEmployees() {
    connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;", 
    function(err, res) {
      if (err) throw err
      console.table(res)
      runPrompt()
  })
}

function viewAllRoles() {
  connection.query("SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id;", 
  function(err, res) {
  if (err) throw err
  console.table(res)
  runPrompt()
  })
}

function viewAllDepartments() {
  connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;", 
  function(err, res) {
    if (err) throw err
    console.table(res)
    runPrompt()
  })
}



  



async function addEmployee() { 
    let roles=[]
    connection.query("SELECT * FROM role",  function(err, res) {
      if (err) throw err
      for (var i = 0; i < res.length; i++) {
        roles.push(res[i].title);
      }
      return roles
    })
    let managers = [];
    connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function(err, res) {
      if (err) throw err
      for (var i = 0; i < res.length; i++) {
        managers.push(res[i].first_name);
      }
      return managers;
    })
    const employee= await inquirer.prompt([
        {
          name: "firstname",
          type: "input",
          message: "Enter their first name "
        },
        {
          name: "lastname",
          type: "input",
          message: "Enter their last name "
        },
        {
          name: "role",
          type: "list",
          message: "What is their role? ",
          choices: roles
        },
        {
            name: "choice",
            type: "rawlist",
            message: "Whats their managers name?",
            choices: managers
        }
    ])

    const roleId = roles.indexOf(employee.role) + 1
    const managerId = managers.indexOf(employee.choice) + 1
    connection.query("INSERT INTO employee SET ?", 
  {
      first_name: employee.firstName,
      last_name: employee.lastName,
      manager_id: managerId,
      role_id: roleId
      
  }, function(err){
      if (err) throw err
      console.table(employee)
      runPrompt()
  })
}



 function updateEmployee() {
  
  connection.query("SELECT * FROM employee",  function(err, res) {
    if (err) throw err
    let lastName=[]
    let roles=[]
    for (var i = 0; i < res.length; i++) {
      lastName.push(res[i].last_name);
    }
    connection.query("SELECT * FROM role",  function(err, res) {
      if (err) throw err
      for (var i = 0; i < res.length; i++) {
        roles.push(res[i].title);
      }
      const employee=  inquirer.prompt([
        {
          name: "lastName",
          type: "list",
          choices:lastName,
          message: "What is the Employee's last name? ",
        },
        {
          name: "role",
          type: "list",
          message: "What is the Employees new title? ",
          choices: roles
        }
      ]).then(val=>{
        const roleId = roles.indexOf(val.role)
        console.log(roleId, val,roles)
        connection.query("UPDATE employee SET WHERE ?", 
          {
            last_name: employee.lastName
              
          }, 
          {
            role_id: roleId
              
          }, 
          function(err){
              if (err) throw err
              console.table(employee)
              runPrompt()
          }
        )
      })
    })
  })
  
}

 function addRole() { 
  connection.query("SELECT role.title AS Title, role.salary AS Salary FROM role",  async function(err, res) {
    const employee= await inquirer.prompt([
        {
          name: "Title",
          type: "input",
          message: "What is the roles Title?"
        },
        {
          name: "Salary",
          type: "input",
          message: "What is the Salary?"

        } 
    ])
    connection.query(
      "INSERT INTO role SET ?",
      {
        title: employee.Title,
        salary: employee.Salary,
      },
      function(err) {
          if (err) throw err
          console.table(employee);
          runPrompt();
      }
  )

  });
  }
  

async function addDepartment() { 

    const department= await inquirer.prompt([
        {
          name: "name",
          type: "input",
          message: "What Department would you like to add?"
        }
    ])
    const query = connection.query(
      "INSERT INTO department SET ? ",
      {
        name: department.name
      
      },
      function(err) {
          if (err) throw err
          console.table(department);
          runPrompt();
      }
  )

  }

  
  