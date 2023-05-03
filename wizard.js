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
async function createBusinessService(packageName, className) {
    // TODO add types of method parameters dependend of the adapter
    const inboundAdapterSuggestion = [
        'None',
        'Ens.Enterprise.MsgBank.BankTCPAdapter',
        'Ens.InboundAdapter',
        'EnsLib.CloudStorage.InboundAdapter',
        'EnsLib.EDI.X12.Adapter.TCPInboundAdapter',
        'EnsLib.EMail.InboundAdapter',
        'EnsLib.File.InboundAdapter',
        'EnsLib.FTP.InboundAdapter',
        'EnsLib.Gateway.ServiceAdapter',
        'EnsLib.HTTP.InboundAdapter',
        'EnsLib.JavaGateway.InboundAdapter',
        'EnsLib.JMS.InboundAdapter',
        'EnsLib.Kafka.InboundAdapter',
        'EnsLib.MFT.InboundAdapter',
        'EnsLib.MQSeries.InboundAdapter',
        'EnsLib.MQTT.Adapter.Inbound',
        'EnsLib.PEX.InboundAdapter',
        'EnsLib.Pipe.InboundAdapter',
        'EnsLib.SOAP.InboundAdapter',
        'EnsLib.SQL.InboundAdapter',
        'EnsLib.SQL.InboundProcAdapter',
        'EnsLib.TCP.CountedInboundAdapter',
        'EnsLib.TCP.CountedXMLInboundAdapter',
        'EnsLib.TCP.DuplexAdapter',
        'EnsLib.TCP.FramedInboundAdapter',
        'EnsLib.TCP.InboundAdapter',
        'EnsLib.TCP.TextLineInboundAdapter',
        'EnsLib.UDP.InboundAdapter',
        'Costum',
    ];
    let inboundAdapter = await vscode.window.showQuickPick(
        inboundAdapterSuggestion,
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
    if (inboundAdapter == 'None') {
        inboundAdapter = '';
    } else {
        inboundAdapter = 'Parameter ADAPTER = "' + inboundAdapter + '";';
    }
    let text =
        'Class ' +
        packageName +
        '.' +
        className +
        ' Extends Ens.BusinessService' +
        ' \n{ \n\n' +
        inboundAdapter +
        '\n\nMethod OnProcessInput(pInput As %RegisteredObject, Output pOutput As %RegisteredObject) As %Status\n' +
        '{\n\n	Quit $$$ERROR($$$NotImplemented)\n}\n\n}';
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
        'None',
        'Ens.Enterprise.MsgBank.ClientTCPAdapter',
        'Ens.AmazonCloudWatch.OutboundAdapter',
        'Ens.AmazonCloudWatchLogs.OutboundAdapter',
        'Ens.AmazonSNS.OutboundAdapter',
        'EnsLib.CloudStorage.OutboundAdapter',
        'EnsLib.EDI.X12.Adapter.TCPOutboundAdapter',
        'EnsLib.EMail.OutboundAdapter',
        'EnsLib.File.OutboundAdapter',
        'EnsLib.FTP.OutboundAdapter',
        'EnsLib.HTTP.OutboundAdapter',
        'EnsLib.JavaGateway.OutboundAdapter',
        'EnsLib.JMS.OutboundAdapter',
        'EnsLib.Kafka.OutboundAdapter',
        'EnsLib.LDAP.Adapter.Outbound',
        'EnsLib.LDAP.OutboundAdapter',
        'EnsLib.MFT.Adapter.Outbound',
        'EnsLib.MQSeries.OutboundAdapter',
        'EnsLib.MQTT.Adapter.Outbound',
        'EnsLib.PEX.OutboundAdapter',
        'EnsLib.Pipe.OutboundAdapter',
        'EnsLib.SAP.OutboundAdapter',
        'EnsLib.Siebel.HTTPOutboundAdapter',
        'EnsLib.SOAP.CST.OutboundAdapter',
        'EnsLib.SOAP.OutboundAdapter',
        'EnsLib.SQL.OutboundAdapter',
        'EnsLib.TCP.CountedOutboundAdapter',
        'EnsLib.TCP.CountedXMLOutboundAdapter',
        'EnsLib.TCP.DuplexAdapter',
        'EnsLib.TCP.FramedOutboundAdapter',
        'EnsLib.TCP.OutboundAdapter',
        'EnsLib.TCP.TextLineOutboundAdapter',
        'EnsLib.Telnet.OutboundAdapter',
        'EnsLib.TN3270.OutboundAdapter',
        'EnsLib.UDP.OutboundAdapter',
        'Costum',
    ];
    let outboundAdapter = await vscode.window.showQuickPick(
        outboundAdapterSuggestion,
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
