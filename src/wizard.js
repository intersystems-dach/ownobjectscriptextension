const vscode = require('vscode');

/**
 * Creates a class with the given name and package name
 * @param {string} packageName The package name
 * @param {string} className The class name
 * @returns {Promise<string>} The class text
 */
async function createClass(packageName, className) {
    let classType = await vscode.window.showQuickPick(
        [
            'Persistent (can be stored within the database)',
            'Serial (can be embedded within persistent objects)',
            'Registered (not stored within the database)',
            'Abstract',
            'Datatype',
            'CSP (used to process HTTP events)',
            'Extends ...',
        ],
        { placeHolder: 'Select the class type' }
    );
    if (classType == undefined) return undefined;
    switch (classType) {
        case 'Persistent (can be stored within the database)':
            classType = 'Extends %Persistent';
            break;
        case 'Serial (can be embedded within persistent objects)':
            classType = 'Extends %SerialObject';
            break;
        case 'Registered (not stored within the database)':
            classType = 'Extends %RegisteredObject';
            break;
        case 'Abstract':
            classType = '[ Abstract ]';
            break;
        case 'Datatype':
            classType = '[ ClassType = datatype ]';
            break;
        case 'CSP (used to process HTTP events)':
            classType = 'Extends %CSP.Page';
            break;
        case 'Extends ...':
            classType = await vscode.window.showInputBox({
                placeHolder: 'Comma-sperated superclasses',
            });
            if (classType == undefined) return undefined;
            if (classType != '') {
                classType = 'Extends (' + classType + ')';
            }
            break;
        default:
            classType = '';
            break;
    }

    let text =
        'Class ' +
        packageName +
        '.' +
        className +
        ' ' +
        classType +
        ' \n{ \n\n}';
    return text;
}

/**
 * Creates a business service with the given name and package name
 * @param {string} packageName The package name
 * @param {string} className The class name
 * @returns {Promise<string>} The class text
 */
async function createBusinessService(
    packageName,
    className,
    addTargetConfigNames
) {
    // TODO add types of method parameters dependend of the adapter
    const inboundAdapterSuggestion = [
        {
            name: 'None',
            input: '',
            output: '',
        },
        {
            name: 'Ens.Enterprise.MsgBank.BankTCPAdapter',
            input: '%Stream.Object',
            output: '%String',
        },
        {
            name: 'Ens.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.CloudStorage.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.EDI.X12.Adapter.TCPInboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.EMail.InboundAdapter',
            input: '%Net.MailMessage',
            output: '',
        },
        {
            name: 'EnsLib.File.InboundAdapter',
            input: '%Stream.Object',
            output: '',
        },
        {
            name: 'EnsLib.FTP.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.Gateway.ServiceAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.HTTP.InboundAdapter',
            input: '%Stream.Object',
            output: '%Stream.Object',
        },
        {
            name: 'EnsLib.JavaGateway.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.JMS.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.Kafka.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.MFT.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.MQSeries.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.MQTT.Adapter.Inbound',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.PEX.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.Pipe.InboundAdapter',
            input: '%Stream.Object',
            output: '',
        },
        {
            name: 'EnsLib.SOAP.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.SQL.InboundAdapter',
            input: 'EnsLib.SQL.Snapshot',
            output: '',
        },
        {
            name: 'EnsLib.SQL.InboundProcAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.CountedInboundAdapter',
            input: '%Stream.Object',
            output: '%Stream.Object',
        },
        {
            name: 'EnsLib.TCP.CountedXMLInboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.DuplexAdapter',
            input: 'Ens.StringContainer',
            output: '',
        },
        {
            name: 'EnsLib.TCP.FramedInboundAdapter',
            input: 'Ens.StreamContainer',
            output: 'Ens.StreamContainer',
        },
        {
            name: 'EnsLib.TCP.InboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.TextLineInboundAdapter',
            input: 'Ens.StringContainer',
            output: 'Ens.StringContainer',
        },
        {
            name: 'EnsLib.UDP.InboundAdapter',
            input: 'Ens.StringContainer',
            output: '',
        },
        {
            name: 'Costum',
            input: '',
            output: '',
        },
    ];
    let inboundAdapter = await vscode.window.showQuickPick(
        inboundAdapterSuggestion.map((x) => x.name),
        { placeHolder: 'Select a InboundAdapter:' }
    );
    if (inboundAdapter == undefined) return undefined;

    if (inboundAdapter == 'Costum') {
        inboundAdapter = await vscode.window.showInputBox({
            placeHolder: 'Inbound Adapter Name',
        });
        if (inboundAdapter == undefined) return undefined;
        if (inboundAdapter == '') {
            inboundAdapter = 'None';
        }
    }

    let inboundAdapterObj = { name: inboundAdapter, input: '', output: '' };

    for (let i = 0; i < inboundAdapterSuggestion.length; i++) {
        if (inboundAdapterSuggestion[i].name == inboundAdapter) {
            inboundAdapterObj = inboundAdapterSuggestion[i];
            break;
        }
    }

    if (inboundAdapter == 'None') {
        inboundAdapter = '';
    } else {
        inboundAdapter = 'Parameter ADAPTER = "' + inboundAdapter + '";';
    }

    let onGetConnectionMethod =
        '/// Return an array of connections for drawing lines on the config diagram\nClassMethod OnGetConnections(Output pArray As %String, pItem As Ens.Config.Item)\n{\n	Do ##super(.pArray,pItem)\n	If pItem.GetModifiedSetting("TargetConfigNames",.tValue) {\n		For i=1:1:$L(tValue,",") { Set tOne=$ZSTRIP($P(tValue,",",i),"<>W")  Continue:""=tOne  Set pArray(tOne)="" }\n	}\n}';

    let targetConfigNamesProperty =
        '/// Configuration item(s) to which to send file stream messages\nProperty TargetConfigNames As %String(MAXLEN = 1000);\n\nParameter SETTINGS = "TargetConfigNames:Basic:selector?multiSelect=1&context={Ens.ContextSearch/ProductionItems?targets=1&productionName=@productionId}";\n\n';

    let onProcessInputImpl = addTargetConfigNames
        ? '   #dim tSC As %Status = $$$OK\n   #dim pRequest As Ens.Request\n\n   // TODO\n\n   For iTarget=1:1:$L(..TargetConfigNames, ",") {\n      Set tOneTarget=$ZSTRIP($P(..TargetConfigNames,",",iTarget),"<>W")\n      Continue:""=tOneTarget\n      $$$sysTRACE("Sending message to \'"_tOneTarget_"\'")\n      Set tSC = ..SendRequestAsync(tOneTarget, pRequest)\n   }\n\n   Quit tSC'
        : '	Quit $$$ERROR($$$NotImplemented)';

    let text =
        'Class ' +
        packageName +
        '.' +
        className +
        ' Extends Ens.BusinessService' +
        ' \n{ \n\n' +
        inboundAdapter +
        (addTargetConfigNames ? targetConfigNamesProperty : '') +
        '\n\nMethod OnProcessInput(pInput As ' +
        (inboundAdapterObj.input === ''
            ? '%RegisteredObject'
            : inboundAdapterObj.input) +
        ', Output pOutput As ' +
        (inboundAdapterObj.output === ''
            ? '%RegisteredObject'
            : inboundAdapterObj.output) +
        ') As %Status\n' +
        '{\n' +
        onProcessInputImpl +
        '\n}\n' +
        (addTargetConfigNames ? onGetConnectionMethod : '') +
        '\n}';
    return text;
}

/**
 * Creates a business operation with the given name and package name
 * @param {string} packageName The package name
 * @param {string} className The class name
 * @returns {Promise<string>} The class text
 */
async function createBusinessOperation(packageName, className) {
    //Adapter

    const outboundAdapterSuggestion = [
        {
            name: 'None',
            input: '',
            output: '',
        },
        {
            name: 'Ens.Enterprise.MsgBank.ClientTCPAdapter',
            input: '',
            output: '',
        },
        {
            name: 'Ens.AmazonCloudWatch.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'Ens.AmazonCloudWatchLogs.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'Ens.AmazonSNS.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.CloudStorage.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.EDI.X12.Adapter.TCPOutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.EMail.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.File.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.FTP.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.HTTP.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.JavaGateway.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.JMS.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.Kafka.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.LDAP.Adapter.Outbound',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.LDAP.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.MFT.Adapter.Outbound',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.MQSeries.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.MQTT.Adapter.Outbound',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.PEX.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.Pipe.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.SAP.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.Siebel.HTTPOutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.SOAP.CST.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.SOAP.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.SQL.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.CountedOutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.CountedXMLOutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.DuplexAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.FramedOutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TCP.TextLineOutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.Telnet.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.TN3270.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'EnsLib.UDP.OutboundAdapter',
            input: '',
            output: '',
        },
        {
            name: 'Costum',
            input: '',
            output: '',
        },
    ];
    let outboundAdapter = await vscode.window.showQuickPick(
        outboundAdapterSuggestion.map((x) => x.name),
        { placeHolder: 'Select a OutboundAdapter:' }
    );
    if (outboundAdapter == undefined) return undefined;

    if (outboundAdapter == 'Costum') {
        outboundAdapter = await vscode.window.showInputBox({
            placeHolder: 'Outbound Adapter Name',
        });
        if (outboundAdapter == undefined) return undefined;
        if (outboundAdapter == '') {
            outboundAdapter = 'None';
        }
    }
    if (outboundAdapter == 'None') {
        outboundAdapter = '';
    } else {
        outboundAdapter =
            'Parameter ADAPTER = "' +
            outboundAdapter +
            '";\n\n' +
            'Property Adapter As ' +
            outboundAdapter +
            ';';
    }

    // Queued or in Process
    let kindOfOperation = await vscode.window.showQuickPick([
        'In Process',
        'Queued',
    ]);
    if (kindOfOperation == undefined) return undefined;
    let invocation = 'Parameter INVOCATION = "Queue";';
    if (kindOfOperation == 'In Process')
        invocation = 'Parameter INVOCATION = "InProc";';

    //Operation Methods
    const messageTypes = [
        'Ens.AlarmRequest',
        'Ens.AlarmResponse',
        'Ens.AlarmTriggerRequest',
        'Ens.AlertRequest',
        'Ens.Background.Request',
        'Ens.Background.Request.ExportMessage',
        'Ens.Request',
        'Ens.Response',
        'Ens.StringRequest',
        'Ens.StringResponse',
        'EnsLib.AmazonCloudWatch.PutMetricAlarmRequest',
        'EnsLib.AmazonCloudWatch.PutMetricDataRequest',
        'EnsLib.AmazonCloudWatchLogs.LogEventsRequest',
        'EnsLib.AmazonCloudWatchLogs.LogEventsResponse',
        'EnsLib.AmazonSNS.PublishRequest',
        'EnsLib.Background.Workflow.ExportRequest',
        'EnsLib.Background.Workflow.ExportResponse',
        'EnsLib.CloudStorage.DeleteRequest',
        'EnsLib.CloudStorage.UploadRequest',
        'EnsLib.ebXML.Operation.MessageTrackerTrackAcknowledgement',
        'EnsLib.ebXML.Operation.MessageTrackerTrackResponse',
        'EnsLib.EDI.BatchDocument',
        'EnsLib.EDI.EDIFACT.Document',
        'EnsLib.EDI.EDIFACT.Segment',
        'EnsLib.EDI.Segment',
        'EnsLib.EDI.X12.Document',
        'EnsLib.EDI.X12.Segment',
        'EnsLib.EDI.XML.Document',
        'EnsLib.EDI.XML.DOM',
        'EnsLib.EDI.XML.Prop',
        'EnsLib.JMS.Message',
        'EnsLib.JMS.Response',
        'EnsLib.Kafka.Message',
        'EnsLib.LDAP.Message.Add',
        'EnsLib.LDAP.Message.Compare',
        'EnsLib.LDAP.Message.Comparison',
        'EnsLib.LDAP.Message.Delete',
        'EnsLib.LDAP.Message.Modify',
        'EnsLib.LDAP.Message.Rename',
        'EnsLib.LDAP.Message.Results',
        'EnsLib.LDAP.Message.Search',
        'EnsLib.LDAP.Message.Status',
        'EnsLib.PEX.Message',
        'EnsLib.PubSub.Request',
        'EnsLib.PubSub.Response',
        'EnsLib.PushNotifications.IdentityManager.NotificationByIdentityRequest',
        'EnsLib.PushNotifications.IdentityManager.NotificationByIdentityResponse',
        'EnsLib.PushNotifications.NotificationRequest',
        'EnsLib.PushNotifications.NotificationResponse',
        'EnsLib.RecordMap.Batch',
        'EnsLib.RecordMap.BatchResponse',
        'EnsLib.RecordMap.BatchRolloverRequest',
        'EnsLib.RecordMap.SimpleBatch',
        'EnsLib.SAP.RFCPING',
        'EnsLib.SAP.RFCPING.Response',
        'EnsLib.Testing.Request',
        'EnsLib.Workflow.TaskRequest',
        'EnsLib.Workflow.TaskResponse',
        'EnsLib.XSLT.TransformationRequest',
        'EnsLib.XSLT.TransformationResponse',
        'Costum',
    ];

    let methods = '';
    let xData = undefined;
    while (true) {
        //Method Name
        let methodName = await vscode.window.showInputBox({
            placeHolder: 'Operation Method Name (leave empty to exit)',
        });
        if (methodName == undefined) return undefined;
        if (methodName == '') {
            break;
        }

        //Request Type
        let requestType = await vscode.window.showQuickPick(messageTypes, {
            placeHolder: 'Request class',
        });
        if (requestType == undefined) return undefined;

        if (requestType == 'Costum') {
            requestType = await vscode.window.showInputBox({
                placeHolder: 'Request Type Name',
            });
            if (requestType == undefined) return undefined;
        }

        //Response Type
        let responseType = await vscode.window.showQuickPick(messageTypes, {
            placeHolder: 'Response class',
        });
        if (responseType == undefined) return undefined;

        if (responseType == 'Costum') {
            responseType = await vscode.window.showInputBox({
                placeHolder: 'Response Type Name',
            });
            if (responseType == undefined) return undefined;
        }

        methods +=
            '\n\nMethod ' +
            methodName +
            '(pRequest As ' +
            requestType +
            ', Output pResponse As ' +
            responseType +
            ') As %Status\n{\n\n	Quit $$$ERROR($$$NotImplemented)\n}';
        if (xData == undefined) xData = '\n\nXData MessageMap\n{\n<MapItems>';
        xData +=
            '\n	<MapItem MessageType="' +
            requestType +
            '">\n		<Method>' +
            methodName +
            '</Method>\n	</MapItem>';
    }

    if (xData == undefined) xData = '';
    else xData += '\n</MapItems>\n}';
    let text =
        'Class ' +
        packageName +
        '.' +
        className +
        ' Extends Ens.BusinessOperation' +
        ' \n{ \n\n' +
        outboundAdapter +
        '\n\n' +
        invocation +
        methods +
        xData +
        '\n\n}';
    return text;
}

async function createMessage(packageName, className) {
    let kind = await vscode.window.showQuickPick(['Request', 'Response'], {
        placeHolder: 'Message Type:',
    });
    if (kind == undefined) return undefined;

    let properties = '';

    while (true) {
        //property Name
        let propName = await vscode.window.showInputBox({
            placeHolder: 'Property Name (leave empty to exit)',
        });
        if (propName == undefined) return undefined;
        if (propName == '') {
            break;
        }
        //Method Name
        let propType = await vscode.window.showInputBox({
            placeHolder: 'Property Type',
        });
        if (propType == undefined) return undefined;

        properties += 'Property ' + propName + ' As ' + propType + ';\n\n';
    }

    let text =
        'Class ' +
        packageName +
        '.' +
        className +
        ' Extends ' +
        (kind == 'Request' ? 'Ens.Request' : 'Ens.Response') +
        ' \n{ \n\n' +
        properties +
        '}';
    return text;
}

module.exports = {
    createClass,
    createBusinessService,
    createBusinessOperation,
    createMessage,
};
