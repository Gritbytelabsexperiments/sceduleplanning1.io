document.addEventListener("DOMContentLoaded", function () {
    function createProject() {
      const projectName = prompt("Enter the name of the project:");
      if (projectName) {
        const currentDate = new Date().toLocaleDateString();
        const projectDetails = {
          name: projectName,
          date: currentDate,
        };
        const projects = JSON.parse(localStorage.getItem("projects")) || [];
        projects.push(projectDetails);
        localStorage.setItem("projects", JSON.stringify(projects));
      }
    }
  
    const buttonWrapper = document.querySelector(".buttonbutton-wrapper");
    buttonWrapper.addEventListener("click", createProject);
  
    const buttonIcon = document.querySelector(".buttonicon-button");
    buttonIcon.addEventListener("click", function () {
      // Redirect to the projects page with projects data in the URL
      const projects = localStorage.getItem("projects");
      window.location.href = `./templates/projects.html?projects=${encodeURIComponent(
        projects
      )}`;
    });
  
    const buttonButton1 = document.querySelector(".frame-wrapper");
    buttonButton1.addEventListener("click", function () {
      // Redirect to the projects page with projects data in the URL
      const projects = localStorage.getItem("projects");
      window.location.href = `./projects.html?projects=${encodeURIComponent(
        projects
      )}`;
    });
  });
  