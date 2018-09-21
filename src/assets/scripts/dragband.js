/**
 * Creates a draggable band from a list of items
 * @copyright S. Derdeyn 2018
 * @license MIT
 */

let dragBand = (function (){
    
    return { init };

    /**
     * Initialized a dragBand instance
     * @arg {Object} element - the container element containing list items
     * @arg {number} intialItemIndex - index of initially selected item
     * @arg {Object} options - optional settings
     * @arg {Object} options.leftScroller - element representing left scrollbutton (default null)
     * @arg {Object} options.rightscroller - element representing right scrollbutton (default null)
     * @arg {number} options.scrollstep - number of px to scroll when using wheel/scrollbutton (default 50)
     * @arg {number} options.elasticWidth - dragging elasticity beyond left/right edges in px (default 100)
     * @arg {number} options.hideScrollerMargin - scrollbutton becomes hidden when less than this px amount from edge (default 20)
     */
    function init(element, intialItemIndex, options){
        let _C = element;
        let startIndex = intialItemIndex >= 0 ? intialItemIndex : null;
        options = options || {};
        let _leftScroller = options.leftScroller;
        let _rightscroller = options.rightscroller;
        let scrollstep = options.scrollstep || 50;
        let elasticWidth = options.elasticWidth || 100;
        let hideScrollerMargin = options.hideScrollerMargin || 20

        let enableScrolling = true;

        let locked = false;
        let startX = null;
        let i = 0, i_next = 0;
        let currentX = getRelativePosition(_C.children[i], _C).x;
        let lastMovement = 0;

        let lastEvent = null;

        let spdPosA = 0;
        let currentSpeed = 0, fadeSpeed = 0;
        let speedometer = setInterval(function(){
            if(!enableScrolling) return;
            let spdPosB = getPosition(_C).x;
            currentSpeed = (spdPosB - spdPosA)*10; // in px/s
            spdPosA = spdPosB;
        },100);

        let N = _C.children.length;

        // need for lef & right limits
        let containerWidth = recalculateContainerWidth();
        let leftLimit = _C.parentElement.offsetLeft;
        let rightLimit = _C.parentElement.offsetWidth - containerWidth;

        let selectedIndex = startIndex;
        selectItem(selectedIndex);

        function selectItem(itemIndex, setPosition = true){
            selectedIndex = itemIndex;
            if(setPosition)
                setX(getPositionForIndex(itemIndex));
            refreshSelection(selectedIndex);
        }

        function recalculateContainerWidth(){
            let width = 0;
            for(let ci = 0; ci < N; ci++){
                width += _C.children[ci].offsetWidth;
                //console.log("child. width " + _C.children[ci].offsetWidth);
            }
            //console.log("cont. width " + width);
            _C.style.width = `${width}px`;
            return width;
        }

        function refreshSelection(index){
            for(let i = 0; i < N; i++){
                _C.children[i].classList.remove('selected');
                if(i == index)
                    _C.children[i].classList.add('selected');
            }
        }

        function setX(newX){
            if(!enableScrolling) return;
            //limit new position
            currentX = Math.min(leftLimit, Math.max(rightLimit, newX));
            _C.style.left = `${ currentX }px`;
            _C.classList.toggle('smooth', !(locked = false));
            refreshScrollers(currentX);
        }

        function refreshScrollers(xPos){
            if(_leftScroller){
                _leftScroller.style.opacity = isLeftScrollerVisible(xPos) ? "1" : "0";
                _leftScroller.style.pointerEvents = isLeftScrollerVisible(xPos) ? "all" : "none"; // enables click-through when disabled
            }
            if(_rightscroller){
                _rightscroller.style.opacity = isRightScrollerVisible(xPos) ? "1" : "0";
                _rightscroller.style.pointerEvents = isRightScrollerVisible(xPos) ? "all" : "none"; // enables click-through when disabled
            }
        }

        function isLeftScrollerVisible(xPos){
            return !(xPos > leftLimit - hideScrollerMargin);
        }

        function isRightScrollerVisible(xPos){
            return !(xPos < rightLimit + hideScrollerMargin);
        }
        
        function resized(e){
            containerWidth = recalculateContainerWidth();
            leftLimit = _C.parentElement.offsetLeft;
            rightLimit = _C.parentElement.offsetWidth - containerWidth;
            //setToItemPosition(i);
            setX(getPositionForIndex(selectedIndex));
        }

        function unify(e) { 
            return e.changedTouches ? e.changedTouches[0] : e 
        };

        function dragStarted(e) {
            if(!enableScrolling) return;
            if(!locked){
                //console.log(e.type);
                lastEvent = e.type;

                startX = unify(e).clientX;
                _C.classList.toggle('smooth', !(locked = true));
            }
        };

        function dragStopped(e) {
            if(!enableScrolling) return;
            //console.log(e.type);
            lastEvent = e.type;

            if(locked) {
                let dx = unify(e).clientX - startX, s = sign(dx), childStarts = [];
                lastMovement = dx;

                let stopX = currentX + lastMovement;
                currentX = stopX + (currentSpeed * .125);
                setX(currentX);
                //console.log("Exit", { currentSpeed, currentX, stopX });

                startX = null;
            }
        };

        function drag(e) { 
            if(!enableScrolling) return;
            //if(lastEvent != e.type ) console.log(e.type);
            //lastEvent = e.type;
            
            if(locked){
                let tx = Math.round(unify(e).clientX - startX);
                let newX = currentX + tx;
                let leftElasticLimit = leftLimit + elasticWidth;
                let rightElasticLimit = rightLimit - elasticWidth;

                if(newX <= leftElasticLimit && newX > rightElasticLimit ){
                    _C.style.left = `${newX}px`;
                    refreshScrollers(newX);
                    //console.log("left set ", [ newX, _C.offsetWidth, containerWidth]);
                }
            }
        };

        function wheel(e){
            if(!enableScrolling) return;
            setX(currentX - sign(e.deltaY) * scrollstep); 
            e.preventDefault();
        }

        document.body.addEventListener('mousemove', drag, false);
        document.body.addEventListener('touchmove', drag, false);

        _C.addEventListener('mousedown', dragStarted, false);
        _C.addEventListener('touchstart', dragStarted, false);

        document.body.addEventListener('mouseup', dragStopped, false);
        document.body.addEventListener('touchend', dragStopped, false);

        window.addEventListener('resize', resized, false);

        _C.addEventListener("wheel", wheel, false);
        
        //bind click handler to children and all their descendants (most likely <a>'s)
        for(let ci = 0; ci < N; ci++){
            var links = _C.children[ci].getElementsByTagName("*"); // just bind to everything underneath.. not just <a>'s
            for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
                links[linkIndex].addEventListener('click', function(e) {
                    //console.log("clicked last move: " + Math.abs(lastMovement));
                    if(Math.abs(lastMovement) >= 50){
                        e.preventDefault();
                        return false;
                    }
                    selectItem(ci, true);
                    this.blur(); //remove ugly FF dashed line
                    //console.log("Clicked a link");
                }, true);
            }
        }

        if(_leftScroller)
            _leftScroller.addEventListener('click', e => { if(isLeftScrollerVisible(currentX)){ setX(currentX + scrollstep); } }, true);
        if(_rightscroller)
            _rightscroller.addEventListener('click', e => { if(isLeftScrollerVisible(currentX)){ setX(currentX - scrollstep); } }, true);

        function getPositionForIndex(itemIndex){
            if(itemIndex !== null){
                let child = _C.children[itemIndex];
                let childLeft = getRelativePosition(child, _C).x;
                return -childLeft + child.offsetWidth/2;
            }
            else{
                return currentX;
            }
        }

        // Helper function to get an element's exact position
        function getPosition(el) {
            var xPos = 0;
            var yPos = 0;
            
            while (el) {
                if (el.tagName == "BODY") {
                    // deal with browser quirks with body/window/document and page scroll
                    var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                    var yScroll = el.scrollTop || document.documentElement.scrollTop;
                
                    xPos += (el.offsetLeft - xScroll + el.clientLeft);
                    yPos += (el.offsetTop - yScroll + el.clientTop);
                } else {
                    // for all other non-BODY elements
                    xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                    yPos += (el.offsetTop - el.scrollTop + el.clientTop);
                }
                el = el.offsetParent;
            }
            return {
                x: xPos,
                y: yPos
            };
        }

        function getRelativePosition(el, elParent) {
            var parentPos = getPosition(elParent);
            var elementPos = getPosition(el);
            
            return {
                x: elementPos.x - parentPos.x,
                y: elementPos.y - parentPos.y
            };
        }

        function setScrollingEnabled(enable){
            enableScrolling = enable;
            if(!enableScrolling){
                _C.style.left = 0;
                if(_leftScroller)
                    _leftScroller.style.display = "none";
                if(_rightscroller)
                    _rightscroller.style.display = "none";
                selectItem(selectedIndex);
            }
            else
            {
                if(_leftScroller)
                    _leftScroller.style.display = "block";
                if(_rightscroller)
                    _rightscroller.style.display = "block";
                selectItem(selectedIndex);
            }
        }

        function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

        return { selectItem, setScrollingEnabled };
    }
}());