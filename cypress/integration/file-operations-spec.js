describe('File operations', function() {
  before(function() {
    // Load fixture projects and subfolder
    cy.visit('http://localhost:5000')
    cy.server()
    var projectId = "";
    cy.fixture('projects.json').then((projects) => {
      projectId = projects[0].id
      cy.route('GET', '*', projects)
      cy.get('input#userId').type('someId')
      cy.get('input#privateToken').type('someToken')
      cy.contains('Load Projects').click()
    })
    cy.fixture('project-folder.json').then((folder) => {
      cy.route('GET', '*', folder)
      cy.get('li#aPlus-' + projectId + ' a').click()
    })
  })
  it('opens a subfolder when it has been clicked', function() {

  })
})
