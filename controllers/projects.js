const { Projects } = require("../models");

const getProjectList = async (req, res) => {
    try {
        const { userId } = req;
        const { companyId } = req.query;

        const projectList = await Projects.getProjectInfoByUserCompanyId(userId, companyId);
        res.json(projectList);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error retrieving project list", error: error.message });
    }
};

const getProjectData = async (req, res) => {
    try {
        const { projectId } = req.query;

        const projectData = await Projects.getById(projectId);
        res.json(projectData);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching project data", error: error.message });
    }
};

const createOrEditProject = async (req, res) => {
    try {
        let { projectData } = req.body;

        if(projectData.appState.projectDetail.hasOwnProperty('projectId')) {
            //edit the company
            const projectId = projectData.appState.projectDetail.projectId;
            await Projects.updateById(projectId, projectData);

            res.status(200).json({
                message: "Update project data successfully",
            });
        } else {
            //create a company
            await Projects.create(projectData);

            res.status(200).json({
                message: "Set project data successfully",
            });
        }

    } catch (error) {
        res
            .status(500)
            .json({ message: "Error retrieving project", error: error.message });
    }
}

module.exports = { getProjectList, getProjectData, createOrEditProject };