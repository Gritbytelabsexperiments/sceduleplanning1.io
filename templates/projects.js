document.addEventListener("DOMContentLoaded", function () {
    const projectListContainer = document.querySelector(".project-list");
    const urlParams = new URLSearchParams(window.location.search);
    const projectsParam = urlParams.get("projects");
    const projects = projectsParam ? JSON.parse(decodeURIComponent(projectsParam)) : [];
  
    function renderProjects() {
      projectListContainer.innerHTML = "";
      if (projects.length > 0) {
        projects.forEach((project, index) => {
          const projectItem = document.createElement("div");
          projectItem.classList.add("project-item");
          projectItem.innerHTML = `
            <p>Project Name: ${project.name}</p>
            <p>Date: ${project.date}</p>
            <span class="delete-button" onclick="deleteProject(${index})">&#10006;</span>
          `;
          projectItem.addEventListener("click", function () {
            openProjectDetails(project); // Add this line to open project details
          });
          projectListContainer.appendChild(projectItem);
        });
      } else {
        projectListContainer.innerHTML = "<p>No projects found.</p>";
      }
    }
  
    function openProjectDetails(project) {
      // Open a new page with project details
      const projectDetailsUrl = `index4.html?name=${encodeURIComponent(project.name)}&date=${encodeURIComponent(project.date)}`;
      window.open(projectDetailsUrl, "_blank");
    }
  
    renderProjects();
  
    window.deleteProject = function (index) {
      projects.splice(index, 1);
      localStorage.setItem("projects", JSON.stringify(projects));
      renderProjects();
    };
  });
  