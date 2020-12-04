function dragElement(windowclass) {
    let elmnt = document.querySelector(windowclass);
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let header = document.querySelector(windowclass + " .widget-header");
    if (header) {
      header.onmousedown = dragMouseDown;
    } else {
        throw new Error("Cannot find header element for "+windowclass);
    }
  
    function dragMouseDown(e) {
        if (e.target.classList.contains("widget-header")) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.body.classList.add('dragging');
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            
        }
    }
  
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.body.classList.remove('dragging');
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
dragElement(".calculator-widget");