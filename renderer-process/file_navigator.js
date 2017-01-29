const _ = require('underscore')

const directoryLink = document.getElementById('directory-link')

// functions

function createElement(type, id, className, innerHTML = "") {
  var element = document.createElement(type)
  if (id) element.id = id
  if (className) element.className = className
  element.innerHTML = innerHTML
  return element
}

function clearContent() {
  while (directoryLink.firstChild) {
      directoryLink.removeChild(directoryLink.firstChild)
  }
}

function createLink(filePath, referer) {
  const path = require('path')

  var file = path.basename(filePath)
  var id = referer === file ? 'directory-current-page' : ''
  var innerHTML = '<span class="icon ' + ensureIconName(filePath) + '"></span>' + file + '</span>'
  var link = createElement('span', id, 'nav-group-item', innerHTML)
  link.setAttribute('href', path.normalize(filePath)) // triming '//'
  return link
}

function ensureIconName(filePath) {
  const fs = require('fs')
  var stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    return "icon-folder"
  }

  return "icon-picture"
}

function findCurrent() {
  var current = document.getElementById('directory-current-page')
  if (current) {
    return current
  }

  current = directoryLink.firstChild
  if (!current) return

  current.id = 'directory-current-page'
  return current
}

function clickFileLink(filePath) {
  const fs = require('fs')
  var stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    functions.jump(filePath)
  }
}

/////////////

class FileNavigator {

  constructor(transport) {
    this.transport = transport
  }

  // change to select a file
  prefiousSibling() {
    var current = findCurrent()
    if (!current) return
    var previous = current.previousSibling
    if (!previous) return
    this.select(previous)
  }

  nextSibling() {
    var current = findCurrent()
    if (!current) return
    var next = current.nextSibling
    if (!next) return
    this.select(next)
  }

  upDirectory() {
    const path = require('path')
    functions.jump(pathInput.value + '/..', path.basename(path.normalize(pathInput.value)))
  }

  downDirectory() {
    var current = findCurrent()
    clickFileLink(current.getAttribute('href'))
  }

  select(element) {
    var current = findCurrent()
    current.id = ''
    element.id = 'directory-current-page'

    this.transport.on({type: 'selectFile', data: element})
  }

  selectRandom() {
    var nodes = []
    var children = directoryLink.childNodes
    for (var i in children) {
      var element = children[i]
      if (element.id != 'directory-current-page') {
        nodes.push(element)
      }
    }
    this.select(_.sample(nodes))
  }

  render(data) {
    clearContent()
    this.transport.on({type: 'changeDirectory', data: data})

    for (var i in data.files) {
      var filePath = data.files[i]

      var link = createLink(filePath, data.referer)
      var self = this
      link.addEventListener("click", function() {
        self.select(this)
        clickFileLink(this.getAttribute('href'))
      }, false)
      directoryLink.appendChild(link)
    }

    // render media
    var current = findCurrent()
    if (current) {
      this.select(current)
    }
  }
}

module.exports = FileNavigator
