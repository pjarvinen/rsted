var projectId = ""
var projectName = ""
var userId = '111'
var privateToken = 'someToken'
var fileJSON = {}

var pageSetup = function() {
  // Load fixture projects and subfolder
  cy.visit('http://localhost:5000')
  cy.server()
  cy.fixture('projects.json').then((projects) => {
    projectId = projects[0].id
    cy.route('GET', '*', projects)
    cy.get('input#userId').type(userId)
    cy.get('input#privateToken').type(privateToken)
    cy.contains('Load Projects').click()
    projectName = projects[0].name
  })
  cy.fixture('project-folder.json').then((folder) => {
    cy.route('GET', '*', folder)
    cy.get('li#aPlus-' + projectId + ' a').click()
  })
}

describe('Folder operations', function() {
  before(pageSetup)
  it('opens a folder operations dropdown list after a link symbol click', function() {
    cy.get('#folder1Operations').click()

  });
});
