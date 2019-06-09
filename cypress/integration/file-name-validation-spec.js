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

describe('File name validation', function() {
  before(pageSetup)
  it('validates new filename after user input', function() {
    Cypress.$('#markItUp').val('**Some text**')
    cy.get('#plussaGuiSaveFileBtn').click()
    cy.get('#plussaGuiNewFilePanel').should('have.class', 'show')
    cy.get('#plussaGuiAddFolderBtn').should('be.visible')
    cy.get('a[rel="folder1"]:first').click()
    cy.get('#plussaGuiPathInput').should((input) => {
      Cypress.$(input).val('someFolderName')
    })
    cy.get('#plussaGuiAddFolderBtn').click()
    cy.get('#plussaGuiPathInput').should((input) => {
      Cypress.$(input).val('wrong-filename')
    })
    cy.get('#plussaGuiSaveNewFileBtn').click()
    cy.get('#plussaGuiReport').should('contain', 'Error')
    cy.get('#plussaGuiPathInput').should((input) => {
      Cypress.$(input).val('filename.txt')
      cy.server()
      cy.route({
        method: 'POST',
        url: '*',
        response: {},
        onRequest: (xhr) => {
          console.log(JSON.stringify(xhr))
          var header = xhr['request']['headers']['PRIVATE-TOKEN']
          expect(header).to.deep.eq(privateToken)
          var url = xhr['xhr']['url']
          // Full file path
          expect(url).to.contain('folder1/someFolderName/filename.txt')
        }
      })
    })
    cy.get('#plussaGuiSaveNewFileBtn').click()
  })
})
