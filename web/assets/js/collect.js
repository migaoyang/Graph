function init() {
    var $ = go.GraphObject.make;  // for conciseness in defining templates
    myDiagram =
        $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
            {
                // have mouse wheel events zoom in and out instead of scroll up and down
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                // support double-click in background creating a new node
                "clickCreatingTool.archetypeNodeData": {
                    name: "知识点",
                    concept: "(概述)",
                    weight:"1",
                    color: "#ffbc00",
                },
                // enable undo & redo
                "undoManager.isEnabled": true,

            });
    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function (e) {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });
    // define the Node template
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            {
                desiredSize: new go.Size(100,100),
                toolTip: $("ToolTip", $(go.TextBlock,"权重的取值范围:[0,1]")),
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "Circle",
                {
                    parameter1: 20,  // the corner has a large radius
                    fill: "#ffbc00",
                    stroke: null,
                    //fill: "whitesmoke",
                    //stroke: "black",
                    portId: "",  // this Shape is the Node's port, not the whole Node
                    fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                    toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true,
                    cursor: "pointer",

                },
                new go.Binding("fill", "color")
            ),

            $(go.TextBlock, textStyle(),  // the name
                {
                    editable: true,
                },
                new go.Binding("text", "name").makeTwoWay()),

            $(go.TextBlock,   // the weight
                {
                    editable: true,
                    alignment: go.Spot.Bottom,
                    toolTip: $("ToolTip", $(go.TextBlock,"取值范围:[0,1]")),
                },
                new go.Binding("text", "weight").makeTwoWay()),


            $("TreeExpanderButton",
                {
                    alignment: go.Spot.BottomRight,
                    visible: true,
                },
            )
        ),
        // unlike the normal selection Adornment, this one includes a Button
        myDiagram.nodeTemplate.selectionAdornmentTemplate =
            $(go.Adornment, "Spot",
                $(go.Panel, "Auto",
                    $(go.Shape, {
                        fill: null,
                        stroke: "lightblue",
                        strokeWidth: 2,
                        strokeDashArray: [6, 6, 2, 2]
                    }),
                    $(go.Placeholder),  // a Placeholder sizes itself to the selected Node
                ),

            ); // end Adornment
    // clicking the button inserts a new node to the right of the selected node,
    // and adds a link to that new node
    function mouseEnter(e, obj) {
        var name_panel = obj.findObject("name_panel");
        var concept_panel = obj.findObject("concept_panel");
        var weight_panel = obj.findObject("weight_panel");
        name_panel.visible = true;
        concept_panel.visible = true;
        weight_panel.visible = true;
        last = obj;

    }

    function mouseLeave(e, obj) {
        var name_panel = obj.findObject("name_panel");
        var concept_panel = obj.findObject("concept_panel");
        var weight_panel = obj.findObject("weight_panel");
        name_panel.visible = false;
        concept_panel.visible = false;
        weight_panel.visible = false;

    }

    // Called when the mouse is over the diagram's background
    function doMouseOver(e) {

    }


    function addNodeAndLink(e, obj) {
        var adornment = obj.part;
        var diagram = e.diagram;
        diagram.startTransaction("Add State");
        // get the node data for which the user clicked the button
        var fromNode = adornment.adornedPart;
        var fromData = fromNode.data;
        // create a new "State" data object, positioned off to the right of the adorned Node
        var toData = {text: "new"};
        var p = fromNode.location.copy();
        p.x += 200;
        toData.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
        // add the new node data to the model
        var model = diagram.model;
        model.mouseLeave(toData);
        // create a link data from the old node data to the new node data
        var linkdata = {
            from: model.getKeyForNodeData(fromData),  // or just: fromData.id
            to: model.getKeyForNodeData(toData),
            relate: "0"
        };
        // and add the link data to the model
        model.addLinkData(linkdata);
        // select the new Node
        var newnode = diagram.findNodeForData(toData);
        diagram.select(newnode);
        diagram.commitTransaction("Add State");
        // if the new node is off-screen, scroll the diagram to show the new node
        diagram.scrollToRect(newnode.actualBounds);
    }

    function textStyle() {
        return { font: "12pt utf-8", stroke: "black", };
    }

    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
            {
                adjusting: go.Link.Stretch,
                reshapable: true, relinkableFrom: true, relinkableTo: true,
                toShortLength: 3,
                toolTip: $("ToolTip", $(go.TextBlock,"取值范围:[0,1]")),
            },
            new go.Binding("points").makeTwoWay(),
            new go.Binding("curviness"),
            $(go.Shape,  // the link shape
                {strokeWidth: 1.5}),
            $(go.Shape,  // the arrowhead
                {toArrow: "standard", stroke: null}),
            $(go.Panel, "Auto",
                $(go.Shape,  // the label background, which becomes transparent around the edges
                    {
                        fill: $(go.Brush, "Radial",
                            {0: "rgb(255, 255, 255)", 0.3: "rgb(255, 255, 255)", 1: "rgba(255, 255, 255, 0)"}),
                        stroke: null
                    }),
                $(go.TextBlock, "0",  // the label text
                    {
                        textAlign: "center",
                        font: "15pt",
                        margin: 4,
                        editable: true
                    },
                    new go.Binding("text", "relate").makeTwoWay())
            )
        );
    // read in the JSON data from the "graph" element
    load();
    // support editing the properties of the selected person in HTML
    if (window.Inspector) myInspector = new Inspector("myInspectorDiv", myDiagram,
        {
            properties: {
                "name": {show: Inspector.showIfNode},
                "concept": {show: Inspector.showIfNode},
                "color": { show: Inspector.showIfNode,type: 'color' },
                "loc": { show: false },
                "key": { show: false },
                "comments": { show: false },
                "from": { show: false },
                "to": { show: false },
                "points": { show: false },
                "text": { show: false },

            }
        });
}

// Show the diagram's model in JSON format
function save() {
    document.getElementById("graph").value = myDiagram.model.toJson();
    let curId = document.getElementById("curId").value;
    let graph = document.getElementById("graph").value;
    //提交数据前 判断
    //节点判断
    if (graph.indexOf("知识点") != -1) {
        $('.alert').html('存在未修改名称的知识点，请修改 -。-').removeClass("hide").addClass('alert-danger').show().delay(2500).fadeOut();
        return;
    }
    //判断 是否存在自连接、孤立节点、关联值
    keys = [];
    validateNode = true;
    doAjax = true;
    graphJson = $.parseJSON( graph );

    validateLink();
    if (validateNode) {
        soleNode();
    }

    if (doAjax && validateNode) {
        $.ajax({
            type: "POST",
            url: "${pageContext.request.contextPath}/CollectServlet?method=collectData",
            data: { curId:curId ,graph:graph},
            success: function(data) {
                if(data != null){
                    $('.alert').html('操作成功').removeClass("hide").addClass('alert-success').show().delay(2500).fadeOut();
                    myDiagram.model = go.Model.fromJson(data);
                }else myDiagram.model = go.Model.fromJson({ "class": "GraphLinksModel",
                    "copiesKey": false,
                    "nodeDataArray": [  ],
                    "linkDataArray": [  ]});
            }
        });
    }
}

function load() {
    myDiagram.model = go.Model.fromJson(document.getElementById("graph").value);
}
function showGraph(curId) {
    console.log(curId)
    $.ajax({
        type: "POST",
        url: "${pageContext.request.contextPath}/CollectServlet?method=findMemo",
        data: { curId:curId },
        dataType:"json",
        success: function(data) {
            if(data != null && data.nodeDataArray.length){
                myDiagram.model = go.Model.fromJson(data);
            }else {
                myDiagram.model = go.Model.fromJson({ "class": "GraphLinksModel",
                    "copiesKey": false,
                    "nodeDataArray": [  ],
                    "linkDataArray": [  ]});

                $('.alert').html('暂无该课程的图谱，可在下方空白区域双击鼠标，制作图谱^-^').removeClass("hide").addClass('alert-danger').show().delay(2500).fadeOut();
            }
        }
    });
    document.getElementById("curId").value = curId;
}

function validateLink() {
    link = graphJson.linkDataArray;
    for (var i=0 ; i < link.length ; i++) {
        if (parseInt(link[i].relate) < 0 || parseInt(link[i].relate) > 1) {
            $('.alert').html('"关联值"的范围为[0,1]，请修改 -。-').removeClass("hide").addClass('alert-danger').show().delay(2500).fadeOut();
            validateNode = false;
            break;
        }
        if (link[i].from == link[i].to) {
            $('.alert').html('存在未与其他节点相连的知识点，请修改 -。-').removeClass("hide").addClass('alert-danger').show().delay(2500).fadeOut();
            validateNode = false;
            break;
        }
        keys.push(link[i].from);
        keys.push(link[i].to);
    }
}

function soleNode(){
    node = graphJson.nodeDataArray;
    for (var i=0 ; i < node.length ; i++) {
        if (parseInt(node[i].weight) < 0 || parseInt(node[i].weight) > 1) {
            $('.alert').html('"权重"的范围为[0,1]，请修改 -。-').removeClass("hide").addClass('alert-danger').show().delay(2500).fadeOut();
            doAjax = false;
            break;
        }
        if (keys.indexOf(node[i].key) == -1) {
            $('.alert').html('图中存在未与其他节点相连的知识点，请修改 -。-').removeClass("hide").addClass('alert-danger').show().delay(2500).fadeOut();
            doAjax = false;
            break;
        }
    }
}

/*
$(".nav-tabs li:first").addClass("active");
$(".nav-tabs li:first a").click();
$('.nav-tabs li a').click(function () {
    $('.nav li').removeClass("active");
    $(this).parent().addClass("active");
})*/
