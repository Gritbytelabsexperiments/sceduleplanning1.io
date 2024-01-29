document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("myModal");
  const buttonWrapper = document.getElementById("button-wrapper");
  const frameContainer = document.getElementById("framecontainer");
  const span = document.getElementsByClassName("close")[0];

  // Function to open the modal
  function openModal() {
    modal.style.display = "block";
  }

  // Function to close the modal
  function closeModal() {
    modal.style.display = "none";
    projectNameInput.value = '';
  }

  // When the user clicks on the button, open the modal
  buttonWrapper.onclick = openModal;
  frameContainer.onclick = openModal;

  // When the user clicks on <span> (x), close the modal
  span.onclick = closeModal;

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal();
    }
  };

  // Handle submit button click
  const submitButton = document.getElementById("submitProjectName");
  submitButton.onclick = function () {
    const projectNameInput = document.getElementById("projectNameInput");
    const projectName = projectNameInput.value.trim();
    
    if (projectName) {
      const currentDate = new Date().toLocaleDateString();
      const projectDetails = {
        name: projectName,
        date: currentDate,
      };
      const projects = JSON.parse(localStorage.getItem("projects")) || [];
      projects.push(projectDetails);
      localStorage.setItem("projects", JSON.stringify(projects));
      openProjectDetails(projectDetails);
      renderProjects(); // Update the projects when a new one is created
      renderCreatedProjects(); // Update the created projects under frame-wrapper
      closeModal(); // Close the modal
    } else {
      alert("Please enter a valid project name.");
    }
  };

    const frameWrapper = document.getElementById("frame-wrapper");
    frameWrapper.addEventListener("click", function () {
        // Redirect to the projects page with projects data in the URL
        const projects = localStorage.getItem("projects");
        window.location.href = `./templates/projects.html?projects=${encodeURIComponent(projects)}`;
    });
    const buttonIcon = document.getElementById("button-icon");
    buttonIcon.addEventListener("click", function () {
        // Redirect to the projects page with projects data in the URL
        const projects = localStorage.getItem("projects");
        window.location.href = `./templates/projects.html?projects=${encodeURIComponent(projects)}`;
    });
    const deleteButtons = document.querySelectorAll(".combined-projects-container .delete-button");
    deleteButtons.forEach((button, index) => {
        button.addEventListener("click", function (event) {
            deleteProject(event, index);
        });
    });
    // Render both created and loaded projects when the page loads
    renderProjects();
    renderCreatedProjects();
});
function deleteProject(event, index) {
    event.stopPropagation(); // Stop the event from propagating to the parent elements
    const projects = JSON.parse(localStorage.getItem("projects")) || [];
    projects.splice(index, 1);
    localStorage.setItem("projects", JSON.stringify(projects));
    renderProjects();
    renderCreatedProjects();
}
function renderCreatedProjects() {
    const createdProjectsContainer = document.getElementById("combined-projects-container");

    const projects = JSON.parse(localStorage.getItem("projects")) || [];

    createdProjectsContainer.innerHTML = ""; // Clear existing content

    if (projects.length > 0) {
        projects.forEach((project, index) => {
            const frameWrapperClone = document.createElement("div");
            frameWrapperClone.classList.add("frame-wrapper");

            frameWrapperClone.innerHTML = `
            <span class="delete-button" onclick="deleteProject(event, ${index})">&#10006;</span>
                <div class="list-item-title-parent">
                    <div class="list-item-title">${project.name}</div>
                    <div class="this-is-the">${project.date}</div>
                </div>
                
            `;

            frameWrapperClone.addEventListener("click", function () {
                openProjectDetails(project);
            });

            createdProjectsContainer.appendChild(frameWrapperClone);
        });
    } else {
        createdProjectsContainer.innerHTML = "<p>No projects found.</p>";
    }
}
function renderProjects() {
    const projectsContainer = document.getElementById("combined-projects-container");
    projectsContainer.innerHTML = "";

    const projects = JSON.parse(localStorage.getItem("projects")) || [];

    if (projects.length > 0) {
        projects.forEach((project, index) => {
            const projectItem = document.createElement("div");
            projectItem.classList.add("project-item");
            projectItem.innerHTML = `
            <span class="delete-button" onclick="deleteProject(${index})">&#10006;</span>
                <p>Project Name: ${project.name}</p>
                <p>Date: ${project.date}</p>
                
            `;

            projectItem.addEventListener("click", function () {
                openProjectDetails(project); // Redirect to project details page
            });

            projectsContainer.appendChild(projectItem);
        });
    } else {
        projectsContainer.innerHTML = "<p>No projects found.</p>";
    }
}
function openProjectDetails(project) {
    // Open a new page with project details
    const projectDetailsUrl = `./templates/index4.html?name=${encodeURIComponent(project.name)}&date=${encodeURIComponent(project.date)}`;
    window.open(projectDetailsUrl, "_blank");
}
