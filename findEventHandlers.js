var findEventHandlers = function (eventType, jqSelector) {
    var $ = jQuery;// to avoid conflict between others frameworks like Mootools
    var anyEvent = false;
    var eventTypes = [];
    
    if(!jqSelector){
        jqSelector = '*';
    }
    
    if(!eventType){
        anyEvent = true;
    }else{
        eventTypes = eventType.split(' ');
    }

    var arrayIntersection = function (array1, array2) {
        return $(array1).filter(function (index, element) {
            return $.inArray(element, $(array2)) !== -1;
        });
    };

    var haveCommonElements = function (array1, array2) {
        return arrayIntersection(array1, array2).length !== 0;
    };
    
    var eventInfo = {};


    var addEventHandlerInfo = function (element, event, $elementsCovered) {
        eventInfo[event.type] = eventInfo[event.type] || {};
        var selector = element.localName || '#document';
        var events = eventInfo[event.type][selector] = eventInfo[event.type][selector] || [];
        var extendedEvent = event;
        
        $.merge(extendedEvent, {targets: $elementsCovered.toArray() });
        
        if($.inArray(events, extendedEvent) === -1){
            events.push(extendedEvent);
        }
    };


    var $elementsToWatch = $(jqSelector);
    if (jqSelector === "*")//* does not include document and we might be interested in handlers registered there
        $elementsToWatch = $elementsToWatch.add(document); 
    var $allElements = $("*").add(document);

    $.each($allElements, function (elementIndex, element) {
        var allElementEvents = $._data(element, "events");
        if (allElementEvents !== void 0) {
            $.each(allElementEvents, function(i, eventContainer) {
                $.each(eventContainer, function(eventIndex, event) {
                    if($.inArray(eventTypes, eventIndex) !== -1 || anyEvent) {
                        var isDelegateEvent = event.selector !== void 0 && event.selector !== null;
                        var $elementsCovered;
                        if (isDelegateEvent) {
                            $elementsCovered = $(event.selector, element); //only look at children of the element, since those are the only ones the handler covers
                        } else {
                            $elementsCovered = $(element); //just itself
                        }
                        if (haveCommonElements($elementsCovered, $elementsToWatch)) {
                            addEventHandlerInfo(element, event, $elementsCovered);
                        }
                    }
                });
            });
        }
    });

    return eventInfo;
};
