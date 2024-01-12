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
            openProjectDetails(projectDetails);
            renderProjects(); // Update the projects when a new one is created
            renderCreatedProjects(); // Update the created projects under frame-wrapper
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

    function openProjectDetails(project) {
        // Open a new page with project details
        const projectDetailsUrl = `./templates/index4.html?name=${encodeURIComponent(project.name)}&date=${encodeURIComponent(project.date)}`;
        window.open(projectDetailsUrl, "_blank");
    }
     
    function deleteProject(event, index) {
        event.stopPropagation(); // Stop the event from propagating to the parent elements
        const projects = JSON.parse(localStorage.getItem("projects")) || [];
        projects.splice(index, 1);
        localStorage.setItem("projects", JSON.stringify(projects));
        renderProjects();
        renderCreatedProjects();
      }
    const buttonWrapper = document.getElementById("button-wrapper");
    buttonWrapper.addEventListener("click", createProject);
    
    const framecontaier = document.getElementById("framecontainer");
    framecontaier.addEventListener("click", createProject);

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

    // Render both created and loaded projects when the page loads
    renderProjects();
    renderCreatedProjects();
});
