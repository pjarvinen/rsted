
var projectId = "";

describe('The Main Page', function() {
  it('successfully loads', function() {
    cy.visit('http://localhost:5000')
  })
  it('gives error report when loading course repositories without user credentials', function() {
    cy.contains('Load Projects')
      .click()
    cy.get('.plussaGuiError')
      .should('contain', 'Error')
  })
  it('constructs a file tree with course repositories as root folders', function() {
    cy.fixture('projects.json').then((projects) => {
      projectId = projects[0].id
      cy.server()
      cy.route('GET', '*', projects)
      cy.get('input#userId').type('someId')
      cy.get('input#privateToken').type('someToken')
      cy.contains('Load Projects').click()
      cy.get('ul.jqueryFileTree')
      cy.get('li.directory')
        .should(($li) => {
          expect($li).to.have.length(2)
          expect($li).to.have.class('collapsed')
        })
    })
  })
  it('prevents file operations before a course repo is opened', function() {
    cy.contains('Save File')
      .should('have.attr', 'disabled')
    cy.contains('New File')
      .should('have.attr', 'disabled')
    cy.contains('Delete File')
      .should('have.attr', 'disabled')
    cy.contains('HTML Preview')
      .should('have.attr', 'disabled')
    cy.contains('Publish')
      .should('have.attr', 'disabled')
  })
  it('opens the project root folder after it has been clicked', function() {
    cy.fixture('project-folder.json').then((folder) => {
      cy.server()
      cy.route('GET', '*', folder)
      cy.get('li#aPlus-' + projectId + ' a').click()
      cy.get('li#aPlus-' + projectId)
        .should('have.class', 'expanded')
      cy.get('li#aPlus-' + projectId + ' ul li')
        .should(($li) => {
          expect($li).to.have.length(4)
        })
      cy.get('li.file')
        .should(($li) => {
          expect($li).to.have.length(2)
        })
    })
  })
  it('enables file operations after a course repo is opened', function() {
    cy.contains('Save File')
      .should('not.have.attr', 'disabled')
    cy.contains('New File')
      .should('not.have.attr', 'disabled')
    cy.contains('Delete File')
      .should('not.have.attr', 'disabled')
    cy.contains('HTML Preview')
      .should('not.have.attr', 'disabled')
    cy.contains('Publish')
      .should('not.have.attr', 'disabled')
  })
})
