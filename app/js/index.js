/*
 *
 * No Files Template
 *
 */
const template = {
  noFiles: '<div class="no-files">There are no files or folders associated with this record.</div>',
  initialMessage: '<div class="no-files">There is no folder associated with the record. Create a folder here or Upload a file to proceed.</div>',
  recordInApproval: '<div class="no-files">This record is waiting for approval. Please come back once approved.</div>',
  notAuthorised: '<div class="no-files extension-auth">Zoho Workdrive For CRM Extension is not authorised. Please authorise. <br> Setup -> Marketplace -> All -> Installed -> Click configure under Zoho Workdrive For CRM -> Authorise</div>',
  somethingWentWrong: '<div class="no-files extension-auth">Something went wrong with the Authorisation. Please contact support@zohocrm.com</div>',
  recordInApprovalAndNotAuthorised: '<div class="no-files extension-auth">This record is waiting for approval and the Extension is not authorised. <br> Please authorise and come back after the record is approved.</div>'
};

/*
 *
 * Global variables
 *
 */

let recordFolderIdGlobal;
let currentFolderId;
let currentInnerFolderId;
let crmModuleName;
let crmRecordId;
let crmRecordInfo;
let recordData;
let tableData = $('#fileListing').html();
Handlebars.registerPartial('fileListingPartial', tableData);
let rowsTemplate = $('#fileListing2').html();
let allFiles;
let pageNumber = 1;
let lastPage = 0;
let currentRecordData;
let buttonClicked = '';
let orgVariables = { teamFolderId: '', parentId: '' };
let allFoldersIds = { accounts: '', contacts: '', deals: '', leads: '', campaigns: '' };

//need to uncomment for fileName
$(".file-rename-btn").click(function(e){
  document.getElementById("showIfRenameClick").style.display="block";
  document.getElementById("showIfDeletConfirmatiom").style.display="none";
  document.getElementById("fordelete").style.display="none";
  document.getElementById("showIfRenameClick").style.marginBottom="6%";
  document.getElementById("renameInputdiv").style.display="block";
  document.getElementById("forSave").style.display="inline-block";

  let checkedBoxes = $('input:checked');
  console.log('checkbox::'+checkedBoxes.length);
  if(checkedBoxes.length>1){
    showPopup("Please select only 1 file to rename","error");
  }else{
  $('#renameModal').modal({
    backdrop: false
  });
  $('#renameModal').modal("toggle")
}
})

//Data for current Record
ZOHO.embeddedApp.on("PageLoad", function (data) {
  if (data && data.Entity) {
    crmModuleName = data.Entity;
    crmRecordId = data.EntityId;
    currentRecordData = data;
    
    fetchRecordInfo(data);
  }
});

/*
 *
 * Function to get Org Variables Team Folder ID and Parent ID
 *
 */

async function getOrgVariables() {
  // let teamFolder = await ZOHO.CRM.API.getOrgVariable("zohoworkdriveforcrm__workdrive_team_folder_id");
  orgVariables.teamFolderId = "uy1p429621f04c3364e40b49b9d1254e10b30";
  // let parentFolder = await ZOHO.CRM.API.getOrgVariable("zohoworkdriveforcrm__workdrive_parent_id");
  orgVariables.parentId = "ikbjsd0ed2e810f254816bc2029e95f37fc09";
}

/*
 *
 * Function to get all the sub folder Ids from the Team Folder
 *
 */

async function getAllFolderIds() {
  // Fetch all the module level sub folders ids and store it in a allFoldersIds global object
  //console.log("BEFORE ALL FOLDERS LIST CALL")
  let allFoldersList;
  try {
    //console.log("TRY BLOCK")
    // allFoldersList = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.getFilesAndFolders, { "folder_id": "4h09y22eb2ca66d97449d9ac80b2ae288d459" });
    allFoldersList =  await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
      "method": "GET",
      "headers": { "Accept": "application/vnd.api+json" },
      "url": "https://www.zohoapis.com/workdrive/api/v1/files/" + orgVariables.teamFolderId
    })
    console.log('allFoldersList::'+JSON.stringify(allFoldersList));
    if (allFoldersList.details.statusMessage.data.attributes.name == 'Customers') {
            allFoldersIds.accounts = allFoldersList.details.statusMessage.data.id;
          } else if (allFoldersList.details.statusMessage.data.attributes.name == 'Contacts') {
            allFoldersIds.contacts = allFoldersList.details.statusMessage.data.id;
          } else if (allFoldersList.details.statusMessage.data.attributes.name == 'Projets') {
            allFoldersIds.deals = allFoldersList.details.statusMessage.data.id;
          } else if (allFoldersList.details.statusMessage.data.attributes.name == 'Leads') {
            allFoldersIds.leads = allFoldersList.details.statusMessage.data.id;
          } else if (allFoldersList.details.statusMessage.data.attributes.name == 'Campaigns') {
            allFoldersIds.campaigns = allFoldersList.details.statusMessage.data.id;
          }
  // allFoldersList.details.statusMessage.data.forEach((el) => {
  //     console.log('testt'+el.attributes);
  //     if (el.attributes.name == 'Customers') {
  //       allFoldersIds.accounts = el.id;
  //     } else if (el.attributes.name == 'Contacts') {
  //       allFoldersIds.contacts = el.id;
  //     } else if (el.attributes.name == 'Projets') {
  //       allFoldersIds.deals = el.id;
  //     } else if (el.attributes.name == 'Leads') {
  //       allFoldersIds.leads = el.id;
  //     } else if (el.attributes.name == 'Campaigns') {
  //       allFoldersIds.campaigns = el.id;
  //     }
  //   });

  } catch (error) {
  console.log("CATCH BLOCK"+ error);
  // console.log(error )

      loading();
      $('.hide-container').css('display', 'block');
      $('.table-body').addClass('inactive');
      $(template.somethingWentWrong).insertBefore('#main-table');


  }


}


/*
 *
 * All APIs that are registered in the Connector
 *
 */

const apiList = {
  getFilesAndFolders: 'zohoworkdriveforcrm.workdrive.get_files_and_folders',
  deleteFileOrFolder: 'zohoworkdriveforcrm.workdrive.delete_file_or_folder',
  createFolder: 'zohoworkdriveforcrm.workdrive.create_folder',
  getAllFoldersOfUser: 'zohoworkdriveforcrm.workdrive.get_all_team_folders_of_user',
  uploadFile: 'zohoworkdriveforcrm.workdrive.upload_file',
  renameFile: 'zohoworkdriveforcrm.workdrive.rename_file',
  uploadFileRevision: 'zohoworkdriveforcrm.workdrive.upload_file_revision',
  uploadFileNoRevision: 'zohoworkdriveforcrm.workdrive.upload_file_no_revision',
  moveFileOrFolder: 'zohoworkdriveforcrm.workdrive.move_file_or_folder',
  getFileOrFolderInfo: 'zohoworkdriveforcrm.workdrive.get_file_or_folder_info',
  addUserToTeamFolder: 'zohoworkdriveforcrm.workdrive.add_user_to_team_folder',
  getUsersFromTeamFolder: 'zohoworkdriveforcrm.workdrive.get_users_from_team_folder',
  createFile: 'zohoworkdriveforcrm.workdrive.create_file'
};

/*
 *
 * Main function that fetches all the files from the specified folder
 *
 */

async function main(recordInfo, isNewRecord = false, isApproved) {
  let allFilesAndFolders;
  let recordFolderId;
  let back = false;
  let approvedStatus = true;
  let authorisationStatus = true;
  let isFolderIdValid = true;

  // Fetch the org variables and store it in a orgVariables global object
  await getOrgVariables();

  if (Object.keys(recordInfo).length) {
    recordFolderId = recordInfo.Workdrive_Id;
  } else if (isNewRecord == false && isApproved != true) {
    recordFolderId = recordFolderIdGlobal;
    currentInnerFolderId = 0;
    back = true;
  } else if (isNewRecord == true) {
    // $('.loading').removeClass('active');
    // $('.loading').addClass('inactive');
    loading();
    $(template.initialMessage).insertBefore('#main-table');
    $('.go-to-workdrive').css('display', 'none');
  } else if (isApproved) {

    // If the record is in approval status, code will come to this part and show the message to the user to come back after approval

    $('.hide-container').css('display', 'block');
    $(template.recordInApproval).insertBefore('#main-table');
    approvedStatus = false;

    $('.loading').removeClass('active');
  }


  // If the record is not waiting for approval then there may be a chance that the user might have not authorised the extension. Below will check if the user is not authorised and show a message to authorise the extension
  if (approvedStatus) {
    if (String(orgVariables.teamFolderId).trim().length == 0) {
      $('.no-files').css('display', 'none');
      $(template.notAuthorised).insertBefore('#main-table');
      $('.hide-container').css('display', 'block');
      loading();
      authorisationStatus = true;
    }
  } else {
    if (String(orgVariables.teamFolderId).trim().length == 0) {
      $('.no-files').css('display', 'none');
      $(template.recordInApprovalAndNotAuthorised).insertBefore('#main-table');
      $('.hide-container').css('display', 'block');
      authorisationStatus = true;
    }
  }

  if (authorisationStatus) {
    // Fetch all the sub folder id's from the team folder and store it in a allFolderIds global object
    await getAllFolderIds();
  }

  //console.log("BEFORE IF")
  // If the record is not in approval and the extension is authorised then the below code will be executed
  if (authorisationStatus && recordFolderId) {
    //console.log("WITHIN IF")

    let data = {
      "folder_id": recordFolderId,
    }
    let getFilesAndFolders =   await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
      "method": "GET",
      "headers": { "Accept": "application/vnd.api+json" },
      "url": "https://www.zohoapis.com/workdrive/api/v1/files/" + recordFolderId
    })
    //console.log(getFilesAndFolders)

    // If the folder id is incorrect in the record then the API will give the code as 401 - this will remove the id from the record
    if (getFilesAndFolders.code != 'SUCCESS') {
      isFolderIdValid = false;
      let config = {
        Entity: crmModuleName,
        APIData: {
          "id": crmRecordId,
          "Workdrive_Id": "",
          "Workdrive_URL": ""
        }
      }
      ZOHO.CRM.API.updateRecord(config)
        .then(function (data) {
          // console.log(data);
         
         // location.reload();
        });

    } else {
      isFolderIdValid = true
    }
console.log('isFolderIdValid'+isFolderIdValid);
    if (isFolderIdValid) {
      let dataList = [];
      // Process and render all the files/folders from the recordFolderId
      allFilesAndFolders = getFilesAndFolders.details.statusMessage.data;
      dataList.push(allFilesAndFolders);
      // console.log(allFilesAndFolders);
      noFile(dataList, false);
    }
  }
}

/*
 *
 * Function to check if the data from the API is available or not. It renderes 'no files' message if there is no data. If the data is available then it calls the function to render table
 *
 */

function noFile(data, isFolder = false, search = false, filterOnly=false) {
  console.log('NoFile'+JSON.stringify(data));
  if (data == undefined || data.length == 0) {
    loading();
    $(template.noFiles).insertBefore('#main-table');
    allFiles = [];
    addPaginationButtons();
  } else {
    if(filterOnly){
      generateTable(data, isFolder);

    }else{
      allFiles = data;
      if (search) {
        loading();
        $('.clear').addClass('active');
      }
      loading();
      generateTable(allFiles, isFolder);

    }

  }
  $('.message').css('display', 'none');
  $('.message-text').html('');
  $('.message-text').css('color', '');
  $('.message-text').css('font-size', '');
}

/*
 *
 * Function that generates Tables and render it in HTML
 *
 */

function generateTable(data, isFolder = true) {
console.log('Test::'+JSON.stringify(data));

  $('.table-body').removeClass('inactive');
  // Display the particular record name as tooltip
  let titleName;
  if (crmModuleName == 'Customer') {
    titleName = crmRecordInfo.Account_Name;
  } else if (crmModuleName == 'Contacts') {
    if (crmRecordInfo.First_Name == null) {
      titleName = crmRecordInfo.Last_Name;
    } else {
      titleName = crmRecordInfo.First_Name + ' ' + crmRecordInfo.Last_Name;
    }
  } else if (crmModuleName == 'Deals') {
    titleName = crmRecordInfo.Deal_Name;
  } else if (crmModuleName == 'Submittals') {
      titleName = crmRecordInfo.Name;
  } else if (crmModuleName == 'Campaigns') {
    titleName = crmRecordInfo.Campaign_Name;
  }
  $('.fa-home').attr('title', titleName);

  // Disable loading icon
  if ($('.loading').hasClass('active')) {
    $('.loading').removeClass('active');
  }
  console.log(rowsTemplate);
  // Compile the rows and form a table
  let compiledRows = Handlebars.compile(rowsTemplate);
  $('.table-body').html(compiledRows({
    rows: data
  }));

  // Add pagination buttons as per the data
  addPaginationButtons();
}

/*
 *
 * Pagination Buttons
 *
 */

function nextPage() {
  let files;
  if (allFiles.length > ((pageNumber + 1) * 50)) {
    files = allFiles.slice((pageNumber * 50), ((pageNumber + 1) * 50));
    pageNumber += 1;
    lastPage = 0;
  } else if (allFiles.length <= ((pageNumber + 1) * 50)) {
    files = allFiles.slice((pageNumber * 50), ((pageNumber + 1) * 50));
    pageNumber += 1;
    lastPage = 1;
  }
  generateTable(files);
}

function prevPage() {
  let files;
  if (pageNumber == 0) {
    files = allFiles.slice(0, 50);
    pageNumber = 1;
  } else {
    files = allFiles.slice(((pageNumber - 1) * 50) - 50, ((pageNumber - 1) * 50));
    pageNumber -= 1;
    lastPage = 0;
  }
  generateTable(files);
}

function addPaginationButtons() {
  if (pageNumber == 1 && allFiles.length > 50) {
    $('.pagination').addClass('active');
    $('.left-btn').addClass('inactive-visibility');
    if ($('.right-btn').hasClass('inactive-visibility')) {
      $('.right-btn').removeClass('inactive-visibility');
      $('.left-btn').addClass('inactive-visibility');
    }
  } else if (pageNumber == 1 && allFiles.length < 50) {
    $('.left-btn').addClass('inactive-visibility');
    $('.right-btn').addClass('inactive-visibility');
  } else if (pageNumber > 1 && Math.ceil(allFiles.length / 50) != pageNumber) {
    $('.left-btn').removeClass('inactive-visibility');
    $('.right-btn').removeClass('inactive-visibility');
  } else if (Math.ceil(allFiles.length / 50) == pageNumber && lastPage == 1) {
    $('.left-btn').removeClass('inactive-visibility');
    $('.right-btn').addClass('inactive-visibility');
  }
}

/*
 *
 * Checkbox action and Delete/Download Buttons display property
 *
 */

function topClick(el) {
  if (el.checked) {
    let count = 0;
    $('.box').each((i, el) => {
      if (i != 0) {
        $(el).prop('checked', true);
        count += 1;
      }
    });
    if (count > 0) {
      enableDeleteAndDownload(el);
    }
  } else {
    let count = 0;
    $('.box').each((i, el) => {
      if (i != 0) {
        $(el).prop('checked', false);
        count += 1;
      }
    });
    if (count > 0) {
      enableDeleteAndDownload(el);
    }
  }
}

function enableDeleteAndDownload(el) {
  let boxes = $('input:checked');
  if (boxes.length >= 1) {
    if (el.checked) {
      showDeleteAndDownload();
      $('.message-text').html('Draft Files (Writer / Sheets / Show) can\'t be deleted');
      $('.message').css('display', 'block');
      setTimeout(function () {
        $('.message').css('display', 'none');
        $('.message-text').html('');
      }, 1000);
    }
  } else {
    if (el.checked) {
      showDeleteAndDownload();
      $('.message-text').html('Draft Files (Writer / Sheets / Show) can\'t be deleted');
      $('.message').css('display', 'block');
      setTimeout(function () {
        $('.message').css('display', 'none');
        $('.message-text').html('');
      }, 1000);
    } else {
      showUploadAndNewFolder();
    }
  }
}

function showDeleteAndDownload() {
  $('.upload').css('display', 'none');
  $('.new-folder').css('display', 'none');
  $('.new-file').css('display', 'none');
  $('.download').css('display', 'block');
  $('.download').css('width', '10%');
  $('.delete').css('display', 'block');
  $('.rename').css('display', 'block');
  $('.btn-delete').removeAttr('disabled');
  $('.file-rename-btn').removeAttr('disabled');
  $('.download-btn').removeAttr('disabled');
}

function showUploadAndNewFolder() {
  $('.download').css('display', 'none');
  $('.delete').css('display', 'none');
  $('.rename').css('display', 'none');
  $('.upload').css('display', 'block');
  $('.upload').css('margin-left', '7%');
  $('.new-folder').css('display', 'block');
  $('.new-folder').css('margin-left', '7%');
  $('.new-file').css('display', 'block');
  $('.btn-delete').attr('disabled', 'true');
  $('.file-rename-btn').attr('disabled', 'true');
  $('.download-btn').attr('disabled', 'true');
}

//FileName need to uncomment

function triggerFileRename() {
  let checkedBoxes = $('input:checked');
  console.log('checkbox::'+checkedBoxes.length);
  if(checkedBoxes.length>1){
    showPopup("Please select only 1 file to rename","error");
    
  }else{
    checkedBoxes.each((i, el) => {
      if (el.name != 'header-box') {
        let id = el.dataset.id;
        let data = {
          "name": $("#rename-input").val()
        }
        const func_name = "renameworkdrivefolderandfiles";
    const req_data = {
      "arguments": JSON.stringify({
        "name": $("#rename-input").val(),
        "resource_Id": id
      })
    };
   ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(function (data){
    location.reload();
   });
      }
    });
  }

}

/*
 *
 * Search Action
 *
 */
$('.search-box').keydown(function (event) {
  if (event.key == 'Enter') {
    if ($('.search-box')[0].value != '') {
      searchFileOrFolder($('.search-box')[0].value);
    }
  }
});


async function searchFileOrFolder(searchValue) {
  if (searchValue==undefined){
    searchValue=$('.search-box')[0].value;
  }
  let searchResult;
  searchResult = [];
  searchResult=await searchWorkdriveFolder(currentFolderId,searchValue);
  if(searchResult.statusText=="nocontent"){
      noFile([], false, true);
      $('.error2').html('No File name found');

  }else{
    noFile(searchResult.details.statusMessage.data, false, true);
  }
  
}

async function viewAllFiles() {
  loading();

  let searchResult;
  searchResult=await viewWorkdriveFiles(currentFolderId);
  if(searchResult.statusText=="nocontent"){
      noFile([], false, true);
      $('.error2').html('No File name found');

  }else{
    noFile(searchResult, false, true);
  }
  
}


/*
 *
 * This function will be called if the Workdrive logo is clicked. It opens the record folder if the record has a folder or opens the Team Folder that is created by the extension
 *
 */

function openWorkdriveFolder() {
  if (crmRecordInfo.Workdrive_URL != null) {
    window.open(crmRecordInfo.Workdrive_URL, "_blank");
    setTimeout(function () { location.reload(); }, 1000);
  } else {
    let url;
    url = `https://workdrive.zoho.com/home/teams/${orgVariables.parentId}/ws/${orgVariables.teamFolderId}/folders/files`;
    window.open(url, "_blank");
    setTimeout(function () { location.reload(); }, 1000);
  }

}

/*
 *
 * Add the current user to the Team Folder if he/she doesn't have access already
 *
 */

function addCurrentUserToTeamFolder() {
 ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
    "method": "GET",
    "headers": { "Accept": "application/vnd.api+json" },
    "url": "https://www.zohoapis.com/workdrive/api/v1/teamfolders/"+orgVariables.teamFolderId+"/members"
  }).then(function (userTeamFolderData) {
      let userEmail;
      console.log(JSON.stringify(userTeamFolderData));
      ZOHO.CRM.CONFIG.getCurrentUser().then(function (data) {
        console.log(data);
        userEmail = data.users[0].email;
        let users =userTeamFolderData.details?.statusMessage?.data;
        let userHasAccess = false;
        for (let i = 0; i < users.length; i++) {
          if (users[i].attributes.share_to_entity_info.email_id == userEmail) {
            userHasAccess = true;
          }
        }

        if (userHasAccess != true) {
        let formData = new FormData();
        formData.append('resource_id', orgVariables.teamFolderId); 
        formData.append('shared_type', "workspace"); 
        formData.append('email_id', userEmail);
        formData.append('role_id', "Organizer"); 
          ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
            "method": "POST",
            "url": "https://www.zohoapis.com/workdrive/api/v1/members",
            "headers": {
              "Content-Type": "multipart/form-data"
          },
          "body": formData
          })
            .then(function (data) {
              console.log('User Added to Team Folder'+JSON.stringify(data));
            }).catch(function (error) {
              console.log(error);
           //   location.reload();
            });
        }
      }).catch(function (error) {
        console.log(error);
       // location.reload();
      });
    }).catch(function (error) {
      console.log(error);
      //location.reload();
    });
}

/*
 *
 * On doing the first action in the related list, the below function will check the record association and creates the necessary folders first then creates the folder for the particular record and returns its id
 *
 */


async function folderStructureCheck() {
  let result, errorId, folderId;
  if (crmModuleName == 'Accounts') {
    let accountName, createAccountFolder, folderURL, accountFolderId, relatedContacts, relatedDeals, contactList, contactFolderIds = [], createAssociatedContacts, dealList, dealsFolderIds = [], createAssociatedDealsFolder, crmRecordUpdate;

    // Try to create a Folder for the Account under Accounts folder
    accountName = crmRecordInfo.Account_Name;

    createAccountFolder = await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
      "method": "POST",
      "headers": { "Accept": "application/vnd.api+json" },
      "url": " https://www.zohoapis.com/workdrive/api/v1/files",
      "data":{ "folder_name": String(accountName).trim(), "parent_id": String(allFoldersIds.accounts).trim() }
    }) ; 
    
      folderId = createAccountFolder.data.id;
      accountFolderId = folderId;


    try {
      // Get the related Contacts and Deals
      relatedContacts = await ZOHO.CRM.API.getRelatedRecords({ Entity: crmModuleName, RecordID: crmRecordId, RelatedList: "Contacts" });
      relatedDeals = await ZOHO.CRM.API.getRelatedRecords({ Entity: crmModuleName, RecordID: crmRecordId, RelatedList: "Deals" });

      // Check if the related contacts are present
      if (relatedContacts != undefined) {
        if (relatedContacts.statusText != "nocontent") {
          contactList = Array.from(relatedContacts.data);

          // Get all the related contacts folder ids if there is any and store it in an array
          for (let i = 0; i < contactList.length; i++) {
            if (contactList[i].Workdrive_Id != null) {
              contactFolderIds.push(contactList[i].Workdrive_Id);
            }
          }
        }
      }

      // Check if the related deals are present 
      if (relatedDeals != undefined) {
        if (relatedDeals.statusText != "nocontent") {
          dealList = Array.from(relatedDeals.data);

          // Get all the related deals folder ids if there is any and store it in an array
          for (let i = 0; i < dealList.length; i++) {
            if (dealList[i].Workdrive_Id != null) {
              dealsFolderIds.push(dealList[i].Workdrive_Id);
            }
          }
        }
      }

    } catch (e) {
      console.log(e)
    }


    // If there is one id in the array, loop through the array and move all the contact folders under this account folder
    if (contactFolderIds.length > 0) {
      let associatedContactsFolderId;
      createAssociatedContacts = await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
        "method": "POST",
        "headers": { "Accept": "application/vnd.api+json" },
        "url": "https://www.zohoapis.com/workdrive/api/v1/files",
        "data":{ "folder_name": "Associated Contacts", "parent_id": String(accountFolderId).trim() }
      }) ; 
      associatedContactsFolderId = createAssociatedContacts.data.id;
      for (let i = 0; i < contactFolderIds.length; i++) {
        await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.moveFileOrFolder, { "file_id": contactFolderIds[i].Workdrive_Id, "parent_id": String(associatedContactsFolderId).trim() });
      }
    }

    // If there is one id in the array, loop through the array and move all the deal folders under this account folder
    if (dealsFolderIds.length > 0) {
      let associatedDealsFolderId;
      createAssociatedDealsFolder = await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
        "method": "POST",
        "headers": { "Accept": "application/vnd.api+json" },
        "url": " https://www.zohoapis.com/workdrive/api/v1/files",
        "data":{ "folder_name": "Associated Deals", "parent_id": String(accountFolderId).trim() }
      }) ; 
      
      associatedDealsFolderId = createAssociatedDealsFolder.data.id;
      for (let i = 0; i < dealsFolderIds.length; i++) {
        await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.moveFileOrFolder, { "file_id": dealsFolderIds[i].Workdrive_Id, "parent_id": String(associatedDealsFolderId).trim() });
      }
    }

    // Construct the folder url and update in the Account record
    folderURL = JSON.parse(createAccountFolder.response).data.attributes.permalink;
    crmRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: crmModuleName, APIData: { id: crmRecordId, Workdrive_Id: folderId, zohoworkdriveforcrm__Workdrive_Folder_URL: folderURL } });
  } else if (crmModuleName == 'Contacts') {
    let contactName, createContactFolder, folderURL, contFirstName, relatedDeals, crmRecordUpdate;

    // Check if the fiest name in the contact is null. If yes, passing an empty string
    if (crmRecordInfo.First_Name == null) {
      contFirstName = ' ';
    } else {
      contFirstName = crmRecordInfo.First_Name + ' ';
    }
    contactName = contFirstName + crmRecordInfo.Last_Name;

    // Check if an account is associated with the Contact
    if (crmRecordInfo.Account_Name == null) {

      // Create a folder for the Contact under Contacts folder
      createContactFolder = await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
        "method": "POST",
        "headers": { "Accept": "application/vnd.api+json" },
        "url": " https://www.zohoapis.com/workdrive/api/v1/files",
        "data":{ "folder_name": String(contactName).trim(), "parent_id": String(allFoldersIds.contacts).trim() }
      }) ; 
        folderId = createContactFolder.data.id;
        folderURL = createContactFolder.data.attributes.permalink;
     
      // Check if there are related deals present in this contact. If yes, check if the deal is not associated with any account and has the workdrive folder associated already. If yes, create the associated deals folder and move those deals folder inside it
      let dealsList, createAssociatedDealsFolder, associatedDealsFolderId;
      try {
        relatedDeals = await ZOHO.CRM.API.getRelatedRecords({ Entity: crmModuleName, RecordID: crmRecordId, RelatedList: "Deals" });
     
        // API will send no content if there are no deals present in the related list
        if (relatedDeals != undefined) {
          if (relatedDeals.statusText != "nocontent") {
            dealsList = Array.from(relatedDeals.data);
            for (let i = 0; i < dealsList.length; i++) {
              if (dealsList[i].Account_Name == null) {
                if (dealsList[i].Workdrive_Id != null) {
                  createAssociatedDealsFolder = 
                  await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
                    "method": "POST",
                    "headers": { "Accept": "application/vnd.api+json" },
                    "url": " https://www.zohoapis.com/workdrive/api/v1/files",
                    "data":{ "folder_name": "Associated Deals", "parent_id": String(folderId).trim() }
                  }) ; 
                  
                  associatedDealsFolderId = createAssociatedDealsFolder.data.id;
                }
              }
            }
          }
        }
      } catch (e) {
        console.log(e)
      }

    } else {
      let accountInfo, associatedContactsFolderId, accountsFilesList, createContactFolder;

      // Fetch data from the associated account
      accountInfo = await ZOHO.CRM.API.getRecord({ Entity: "Accounts", RecordID: crmRecordInfo.Account_Name.id });

      // If the account is in approval then the api will throw nocontent message. Checking the same. If the associated account is waiting for approval then it will create the contact folder under Contacts and load the related list
      if (accountInfo.statusText != 'nocontent') {
        if (accountInfo.data[0].Workdrive_Id != null) {

          // Check if the Associated Contacts folder already exists
          associatedContactsFolderId = "";
          accountsFilesList = await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
            "method": "GET",
            "headers": { "Accept": "application/vnd.api+json" },
            "url": "https://www.zohoapis.com/workdrive/api/v1/files/" + accountInfo.data[0].Workdrive_Id+"/files"
          }) ;
          JSON.parse(accountsFilesList.response).data.forEach((el) => {
            // console.log(el);
            if (el.attributes.name == 'Associated Contacts') {
              associatedContactsFolderId = el.id;
            }
          });


          if (associatedContactsFolderId != "") {
            createContactFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(contactName).trim(), "parent_id": String(associatedContactsFolderId).trim() });
            folderId = JSON.parse(createContactFolder.response).data.id;
          } else {
            let associatedContactsFolder, associateContactsFolderId;

            // Create associated contacts folder inside the account folder
            associatedContactsFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": "Associated Contacts", "parent_id": String(accountInfo.data[0].Workdrive_Id).trim() });
            associateContactsFolderId = JSON.parse(associatedContactsFolder.response).data.id;

            // Create the contact folder within the associated contacts folder
            createContactFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(contactName).trim(), "parent_id": String(associateContactsFolderId).trim() });
            folderId = JSON.parse(createContactFolder.response).data.id;
            folderURL = JSON.parse(createContactFolder.response).data.attributes.permalink;
          }
        } else {
          let accountFolder, accountFolderId, accountFolderURL, accountRecordUpdate, associatedContactsFolder, associateContactsFolderId;

          // Create the folder for the associated account
          accountFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(accountInfo.data[0].Account_Name).trim(), "parent_id": String(allFoldersIds.accounts).trim() });

          // Construct the folder url for the account folder
          accountFolderId = JSON.parse(accountFolder.response).data.id;
          accountFolderURL = JSON.parse(accountFolder.response).data.attributes.permalink;

          // Update the account folder id and url in the account record
          accountRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: "Accounts", APIData: { id: crmRecordInfo.Account_Name.id, Workdrive_Id: accountFolderId, zohoworkdriveforcrm__Workdrive_Folder_URL: accountFolderURL } });

          // Create the associated contacts folder
          associatedContactsFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": "Associated Contacts", "parent_id": String(accountFolderId).trim() });
          associateContactsFolderId = JSON.parse(associatedContactsFolder.response).data.id;

          // Create the contact folder within the associated contacts folder
          createContactFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(contactName).trim(), "parent_id": String(associateContactsFolderId).trim() });
          folderId = JSON.parse(createContactFolder.response).data.id;
          folderURL = JSON.parse(createContactFolder.response).data.attributes.permalink;
        }
      } else {
        let createContactFolder;

        // If the account record is in approval, we wouldn't be able to fetch any info from the account. Hence, it will create the Contact folder inside the Contacts folder. Later if the user accesses the record after the record is approved, it will be moved to Accounts under Associated Contacts
        createContactFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(contactName).trim(), "parent_id": String(allFoldersIds.contacts).trim() });
        folderId = JSON.parse(createContactFolder.response).data.id;
        folderURL = JSON.parse(createContactFolder.response).data.attributes.permalink;
      }
    }

    crmRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: crmModuleName, APIData: { id: crmRecordId, Workdrive_Id: folderId, zohoworkdriveforcrm__Workdrive_Folder_URL: folderURL } });
  } else if (crmModuleName == 'Projects') {
    let dealName, folderURL, crmRecordUpdate;
    dealName = crmRecordInfo.Deal_Name;

    // Check if the account and contact is not associated with the deal
    if (crmRecordInfo.Account_Name == null) {
      if (crmRecordInfo.Contact_Name == null) {
        let createDealFolder;

        // Create deal folder inside the Deals folder
        createDealFolder = await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
          "method": "POST",
          "headers": { "Accept": "application/vnd.api+json" },
          "url": " https://www.zohoapis.com/workdrive/api/v1/files",
          "data":{ "folder_name": String(dealName).trim(), "parent_id": String(allFoldersIds.deals).trim() }
        }) ; 
          folderId = createDealFolder.data.id;
          folderURL = createDealFolder.data.attributes.permalink;
       
      } else {
        let contactInfo;

        // Get the associated contact info
        contactInfo = await ZOHO.CRM.API.getRecord({ Entity: "Contacts", RecordID: crmRecordInfo.Contact_Name.id });

        // If the associated contact is waiting for approval then the api will send nocontent. If it sends it, deal folder will be created in Deals and it renders the files in the related list. Next time if a user access the contact record after approval then it will create associated deals folder and associates the deal folders
        if (contactInfo.statusText != 'nocontent') {
          if (contactInfo.data[0].Workdrive_Id != null) {
            let associatedDealsFolderId, contactFolders;

            // Check if the Contact already has Associated Deals folder inside it
            associatedDealsFolderId = '';
            contactFolders =await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
              "method": "GET",
              "headers": { "Accept": "application/vnd.api+json" },
              "url": "https://www.zohoapis.com/workdrive/api/v1/files/" + contactInfo.data[0].Workdrive_Id+"/files"
            }) ; 

            JSON.parse(contactFolders.response).data.forEach((el) => {
              if (el.attributes.name == 'Associated Deals') {
                associatedDealsFolderId = el.id;
              }
            });

            // Goes inside the if condition if the contact has the associated deals folder already
            if (associatedDealsFolderId != '') {
              let createDealFolder;

              // Create the deal folder inside the associated contacts folder
              createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim(), "parent_id": String(associatedDealsFolderId).trim() });

              // If there is any error while creating the folder, it checks the error. Probably the error may due to the different folder has the same name. To overcome it, it will try to create the folder again with deal name along with the record id
              if (createDealFolder.response.includes('errors')) {
                result = JSON.parse(createDealFolder.response);
                errorId = result.errors[0].id;
                if (errorId == 'R002') {
                  createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim() + ' - ' + crmRecordId, "parent_id": String(associatedDealsFolderId).trim() });
                  folderId = JSON.parse(createDealFolder.response).data.id;
                  folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
                }
              } else {
                folderId = JSON.parse(createDealFolder.response).data.id;
                folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
              }
            } else {
              let createAssociatedDealsFolder, associatedDealsFolderId, createDealFolder;

              // Create associated deals folder inside the contact
              createAssociatedDealsFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": "Associated Deals", "parent_id": String(contactInfo.data[0].Workdrive_Id).trim() });
              associatedDealsFolderId = JSON.parse(createAssociatedDealsFolder.response).data.id;

              // Create deal folder inside the created associated deals folder
              createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim(), "parent_id": String(associatedDealsFolderId).trim() });
              folderId = JSON.parse(createDealFolder.response).data.id;
              folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
            }
          } else {
            let createContactFolder, contactFolderId, contactFolderURL, contactRecordUpdate, createAssociatedDeals, associatedDealsId, createDealFolder;

            // Create the contact folder inside the Contacts folder
            createContactFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(crmRecordInfo.Contact_Name.name).trim(), "parent_id": String(allFoldersIds.contacts).trim() });

            contactFolderId = JSON.parse(createContactFolder.response).data.id;

            // Construct the folder url
            contactFolderURL = JSON.parse(createContactFolder.response).data.attributes.permalink;

            // Update the folder id and folder url in the associated contact record
            contactRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: "Contacts", APIData: { id: crmRecordInfo.Contact_Name.id, Workdrive_Id: contactFolderId, zohoworkdriveforcrm__Workdrive_Folder_URL: contactFolderURL } });

            // Create associated deals folder
            createAssociatedDeals = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": "Associated Deals", "parent_id": String(contactFolderId).trim() });
            associatedDealsId = JSON.parse(createAssociatedDeals.response).data.id;

            // Create deal folder
            createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim(), "parent_id": String(associatedDealsId).trim() });
            folderId = JSON.parse(createDealFolder.response).data.id;
            folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
          }
        } else {
          let createDealFolder;

          // If the associated Contact is waiting for approval then it will create the deal folder inside the Deals folder and moves further to render the files in the related list. Later if the user access the contact record or the deal record after approval, it will create the associated deals folder and moves the deal folder inside it
          createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim(), "parent_id": String(allFoldersIds.deals).trim() });
          if (createDealFolder.response.includes('errors')) {
            result = JSON.parse(createDealFolder.response);
            errorId = result.errors[0].id;
            if (errorId == 'R002') {
              createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim() + ' - ' + crmRecordId, "parent_id": String(allFoldersIds.deals).trim() });
              folderId = JSON.parse(createDealFolder.response).data.id;
              folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
            }
          } else {
            folderId = JSON.parse(createDealFolder.response).data.id;
            folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
          }
        }
      }
    } else {
      let accountInfo;

      // Fetch the associated account info
      accountInfo = await ZOHO.CRM.API.getRecord({ Entity: "Accounts", RecordID: crmRecordInfo.Account_Name.id });

      // If the associated account record is waiting for approval then we can't proceed further. Hence, we will create the deal folder inside Deals module and proceed further to render the files in the related list. Lated once the account is approved, when the user accesses the deal or account record then it will automatically create the associated Deals related list and moves the folder
      if (accountInfo.statusText != 'nocontent') {
        if (accountInfo.data[0].Workdrive_Id != null) {
          let associatedDealsFolderId, accountFolders;

          // Check if the Contact already has Associated Deals folder inside it
          associatedDealsFolderId = '';
          accountFolders = await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
            "method": "GET",
            "headers": { "Accept": "application/vnd.api+json" },
            "url": "https://www.zohoapis.com/workdrive/api/v1/files/" + accountInfo.data[0].Workdrive_Id+"/files"
          }) ;
          JSON.parse(accountFolders.response).data.forEach((el) => {
            if (el.attributes.name == 'Associated Deals') {
              associatedDealsFolderId = el.id;
            }
          });

          if (associatedDealsFolderId != '') {
            let createDealFolder;

            // Create the deal folder inside the associated account folder
            createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim(), "parent_id": String(associatedDealsFolderId).trim() });

            // If there is any error while creating the folder, it checks the error. Probably the error may due to the different folder has the same name. To overcome it, it will try to create the folder again with deal name along with the record id
            if (createDealFolder.response.includes('errors')) {
              result = JSON.parse(createDealFolder.response);
              errorId = result.errors[0].id;
              if (errorId == 'R002') {
                createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim() + ' - ' + crmRecordId, "parent_id": String(associatedDealsFolderId).trim() });
                folderId = JSON.parse(createDealFolder.response).data.id;
                folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
              }
            } else {
              folderId = JSON.parse(createDealFolder.response).data.id;
              folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
            }
          } else {
            let createAssociatedDealsFolder, associatedDealsFolderId, createDealFolder;

            // Create associated deals folder inside the account
            createAssociatedDealsFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": "Associated Deals", "parent_id": String(accountInfo.data[0].Workdrive_Id).trim() });
            associatedDealsFolderId = JSON.parse(createAssociatedDealsFolder.response).data.id;

            // Create deal folder inside the created associated deals folder
            createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim(), "parent_id": String(associatedDealsFolderId).trim() });
            folderId = JSON.parse(createDealFolder.response).data.id;
            folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
          }
        } else {
          let createAccountFolder, accountFolderId, accountFolderURL, accountRecordUpdate, createAssociatedDeals, associatedDealsId, createDealFolder;

          // Create the contact folder inside the Contacts folder
          createAccountFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(crmRecordInfo.Account_Name.name).trim(), "parent_id": String(allFoldersIds.accounts).trim() });
          accountFolderId = JSON.parse(createAccountFolder.response).data.id;

          // Construct the folder url
          accountFolderURL = JSON.parse(createAccountFolder.response).data.attributes.permalink;

          // Update the folder id and folder url in the associated contact record
          accountRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: "Accounts", APIData: { id: crmRecordInfo.Account_Name.id, Workdrive_Id: accountFolderId, zohoworkdriveforcrm__Workdrive_Folder_URL: accountFolderURL } });

          // Create associated deals folder
          createAssociatedDeals = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": "Associated Deals", "parent_id": String(accountFolderId).trim() });
          associatedDealsId = JSON.parse(createAssociatedDeals.response).data.id;

          // Create deal folder
          createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim(), "parent_id": String(associatedDealsId).trim() });
          folderId = JSON.parse(createDealFolder.response).data.id;
          folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
        }
      } else {
        let createDealFolder;

        // If the associated Account is waiting for approval then it will create the deal folder inside the Deals folder and moves further to render the files in the related list. Later if the user access the account record or the deal record after approval, it will create the associated deals folder and moves the deal folder inside it
        createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim(), "parent_id": String(allFoldersIds.deals).trim() });
        if (createDealFolder.response.includes('errors')) {
          result = JSON.parse(createDealFolder.response);
          errorId = result.errors[0].id;
          if (errorId == 'R002') {
            createDealFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(dealName).trim() + ' - ' + crmRecordId, "parent_id": String(allFoldersIds.deals).trim() });
            folderId = JSON.parse(createDealFolder.response).data.id;
            folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
          }
        } else {
          folderId = JSON.parse(createDealFolder.response).data.id;
          folderURL = JSON.parse(createDealFolder.response).data.attributes.permalink;
        }
      }
    }

    crmRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: crmModuleName, APIData: { id: crmRecordId, Workdrive_Id: folderId, zohoworkdriveforcrm__Workdrive_Folder_URL: folderURL } });
  } else if (crmModuleName == 'Leads') {
    let leadName, leadFirstName, createLeadFolder;

    // Check if the fiest name in the contact is null. If yes, passing an empty string
    if (crmRecordInfo.First_Name == null) {
      leadFirstName = ' ';
    } else {
      leadFirstName = crmRecordInfo.First_Name + ' ';
    }
    leadName = leadFirstName + crmRecordInfo.Last_Name;

    createLeadFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(leadName).trim(), "parent_id": String(allFoldersIds.leads).trim() });
    if (createLeadFolder.response.includes('errors')) {
      result = JSON.parse(createLeadFolder.response);
      errorId = result.errors[0].id;
      if (errorId == 'R002') {
        createLeadFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(leadName).trim() + ' - ' + crmRecordId, "parent_id": String(allFoldersIds.leads).trim() });
        folderId = JSON.parse(createLeadFolder.response).data.id;
      }
    } else {
      folderId = JSON.parse(createLeadFolder.response).data.id;
    }
    folderURL = JSON.parse(createLeadFolder.response).data.attributes.permalink;
    crmRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: crmModuleName, APIData: { id: crmRecordId, Workdrive_Id: folderId, zohoworkdriveforcrm__Workdrive_Folder_URL: folderURL } });
  } else if (crmModuleName == 'Campaigns') {
    let campaignName, createCampaignFolder;

    campaignName = crmRecordInfo.Campaign_Name;

    createCampaignFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(campaignName).trim(), "parent_id": String(allFoldersIds.campaigns).trim() });
    if (createCampaignFolder.response.includes('errors')) {
      result = JSON.parse(createCampaignFolder.response);
      errorId = result.errors[0].id;
      if (errorId == 'R002') {
        createCampaignFolder = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFolder, { "folder_name": String(campaignName).trim() + ' - ' + crmRecordId, "parent_id": String(allFoldersIds.campaigns).trim() });
        folderId = JSON.parse(createCampaignFolder.response).data.id;
      }
    } else {
      folderId = JSON.parse(createCampaignFolder.response).data.id;
    }

    folderURL = JSON.parse(createCampaignFolder.response).data.attributes.permalink;
    crmRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: crmModuleName, APIData: { id: crmRecordId, Workdrive_Id: folderId, zohoworkdriveforcrm__Workdrive_Folder_URL: folderURL } });
  }

  return folderId;
}




async function createFile(el) {
  let folderId, createZFile, fileName;
  // console.log(el);
  if (currentInnerFolderId) {
    folderId = currentInnerFolderId;
  } else {
    if (currentFolderId) {
      folderId = currentFolderId;
    } else {
      folderId = await folderStructureCheck();
    }
  }

  addCurrentUserToTeamFolder();

  if (el.value == "zw") {
    fileName = "Untitled Document";
  } else if (el.value == "zohosheet") {
    fileName = "Untitled Spreadsheet";
  } else if (el.value == "zohoshow") {
    fileName = "Untitled Presentation";
  }

  createZFile = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.createFile, { "file_name": fileName, "service_type": el.value, "parent_id": String(folderId).trim() });
  window.open(JSON.parse(createZFile.response).data.attributes.permalink, "_blank");
  setTimeout(function () { location.reload(); }, 1500);
}

//New Folder 
async function createNewFolder(){
  if(document.getElementById("inputText5").value !=''){
  console.log(currentInnerFolderId);
    const func_name = "deletefolderfromworkdrive1";
    const req_data = {
      "arguments": JSON.stringify({
        "fileId": currentInnerFolderId.trim(),
        "functionForDelete": "For_Create",
        "FolderName":document.getElementById("inputText5").value
      })
    };
   ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(function (data){
    console.log(JSON.stringify(data));
    location.reload();
   });
  }else{
    showPopup("Please enter file Name","error");
  }
}


/*
 *
 * New Folder Input Toggle
 *
 */

function showInputAndButton() {
  if ($('.new-folder-container').hasClass('active')) {
    $('.new-folder-container').removeClass('active');
    $('.new-folder-btn').css('background-color', '');
  } else {
    $('.new-folder-container').addClass('active');
    $('.new-folder-input').focus();
  }
}
$('.new-folder-input').keydown(function (event) {
  if (event.key == 'Enter') {
    createNewFolder();
  }
});
// Need to uncomment for download
function downloadFile() {
  let checkedBoxes = $('input:checked');
  let checkBoxesArr = [];
  let links = [];
  let folderCount = 0;
  checkBoxFolder=[];
  checkedBoxes.each((i, el) => {
    console.log(el.dataset.url);
    if (el.name != 'header-box') {
      let file = {
        type: el.dataset.type,
        url: el.dataset.url,
        name: el.name,
        id: el.dataset.id
      };
      if (el.dataset.type == 'folder') {
        folderCount += 1;
        checkBoxFolder.push({
          type: el.dataset.type,
          url: el.dataset.url,
          name: el.name,
          id: el.dataset.id
        });
      } else {
        checkBoxesArr.push(file);
      }
    }
  });

  if (folderCount > 0) {
    let count = 0;
    checkBoxFolder.forEach(eachselectedFolder=>{
      const func_name = "deletefolderfromworkdrive1";
   const req_data = {
     "arguments": JSON.stringify({
       "fileId": `${eachselectedFolder["id"]}`,
       "functionForDelete": "Download_Folder",
       "FolderName":''
     })
   };
  ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(function (data){
    count = count +1;
   console.log(data?.code);
   console.log(data?.details?.output);
   if(data?.code == 'success' && data?.details?.output){
     console.log('inside');      
   returnAnchorforFolder(data.details.output).click();
   }
  });
   })
   if(count == checkBoxFolder.length){
    $(".message-text").html("Download Complete!");
}
  }
  if (checkBoxesArr.length >= 1 ) {
    switch (checkBoxesArr.length) {
      case 1:
        let anch = returnAnchor(checkBoxesArr[0]);
        anch.target = '';
        anch.click();
        break;
      case 2:
        returnAnchor(checkBoxesArr[0]).click();
        returnAnchor(checkBoxesArr[1]).click();
        break;
      case 3:
        returnAnchor(checkBoxesArr[0]).click();
        returnAnchor(checkBoxesArr[1]).click();
        returnAnchor(checkBoxesArr[2]).click();
        break;
      case 4:
        returnAnchor(checkBoxesArr[0]).click();
        returnAnchor(checkBoxesArr[1]).click();
        returnAnchor(checkBoxesArr[2]).click();
        returnAnchor(checkBoxesArr[3]).click();
        break;
      case 5:
        returnAnchor(checkBoxesArr[0]).click();
        returnAnchor(checkBoxesArr[1]).click();
        returnAnchor(checkBoxesArr[2]).click();
        returnAnchor(checkBoxesArr[3]).click();
        returnAnchor(checkBoxesArr[4]).click();
        break;
      case 6:
        returnAnchor(checkBoxesArr[0]).click();
        returnAnchor(checkBoxesArr[1]).click();
        returnAnchor(checkBoxesArr[2]).click();
        returnAnchor(checkBoxesArr[3]).click();
        returnAnchor(checkBoxesArr[4]).click();
        returnAnchor(checkBoxesArr[5]).click();
        break;
      case 7:
        returnAnchor(checkBoxesArr[0]).click();
        returnAnchor(checkBoxesArr[1]).click();
        returnAnchor(checkBoxesArr[2]).click();
        returnAnchor(checkBoxesArr[3]).click();
        returnAnchor(checkBoxesArr[4]).click();
        returnAnchor(checkBoxesArr[5]).click();
        returnAnchor(checkBoxesArr[6]).click();

        break;
      case 8:
        returnAnchor(checkBoxesArr[0]).click();
        returnAnchor(checkBoxesArr[1]).click();
        returnAnchor(checkBoxesArr[2]).click();
        returnAnchor(checkBoxesArr[3]).click();
        returnAnchor(checkBoxesArr[4]).click();
        returnAnchor(checkBoxesArr[5]).click();
        returnAnchor(checkBoxesArr[6]).click();
        returnAnchor(checkBoxesArr[7]).click();
        break;
      case 9:
        returnAnchor(checkBoxesArr[0]).click();
        returnAnchor(checkBoxesArr[1]).click();
        returnAnchor(checkBoxesArr[2]).click();
        returnAnchor(checkBoxesArr[3]).click();
        returnAnchor(checkBoxesArr[4]).click();
        returnAnchor(checkBoxesArr[5]).click();
        returnAnchor(checkBoxesArr[6]).click();
        returnAnchor(checkBoxesArr[7]).click();
        returnAnchor(checkBoxesArr[8]).click();
        break;
      default:
        console.log('No files selected');
    }
    setTimeout(function () {
      $(".message-text").html("Download Complete!");
    }, 3000);
  }
 
}

/*
 *
 * Creates an Anchor Element at DOM and returns the created Anchor
 *
 */
//For File Only
function returnAnchor(data) {
  let anchor = document.createElement('a');
  $('body').append(anchor);
  anchor.href = data.url;
  anchor.target = '_blank';
  return anchor;
}

//For Folder Only
function returnAnchorforFolder(data) {
  console.log('inside');
  let anchor = document.createElement('a');
  $('body').append(anchor);
  anchor.href = data;
  anchor.target = '_blank';
  return anchor;
}

/*
 *
 * File Upload
 *
 */

function triggerFileUpload() {
  $('#file-upload').trigger('click');
}
async function getAllFileData(folderId) {
  let allFilesAndFolders;
  let recordFolderId;
  let reteriveFile = [];
    recordFolderId = currentFolderId;

    let data = {
      "folder_id":folderId.trim(),
    }
   // let getFilesAndFolders = await ZOHO.CRM.CONNECTOR.invokeAPI(apiList.getFilesAndFolders, data);
      // Process and render all the files/folders from the recordFolderId
    let associatedContactsFiles = await ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
      "method": "GET",
      "headers": { "Accept": "application/vnd.api+json" },
      "url": "https://www.zohoapis.com/workdrive/api/v1/files/" + folderId.trim()+"/files"
    }) ;
    allFilesAndFolders = associatedContactsFiles.details.statusMessage.data;
console.log('allFilesAndFolders::'+JSON.stringify(allFilesAndFolders));
    let compiledRows = Handlebars.compile(rowsTemplate);
    $('.table-body').html(compiledRows({
      rows: allFilesAndFolders
    }));
    $('.loading').removeClass('active');
    }
async function uploadFile(el) {
  let files = $('#file-upload')[0].files;
  let folderId = 0;
  let failure = 0;
  $('.no-files').css('display', 'none');
  $('.table-body').addClass('inactive');
  loading();
  if (currentInnerFolderId) {
    folderId = currentInnerFolderId;
  } else {
    if (currentFolderId) {
      folderId = currentFolderId;
    } else {
      folderId = await folderStructureCheck();
    }
  }
  let allUpload = await upload(files, folderId, failure);
  addCurrentUserToTeamFolder();
  if (allUpload.cancelCount == 0 || files.length != allUpload.cancelCount || files.length != allUpload.allFilesCount) {
    if (allUpload.allFilesCount > 0) {
      $('.message').css('display', 'block');
      $('.message-text').html('Please check the file name. The only allowed characters are & - _');
      setTimeout(function () {
        if (files.length != (allUpload.cancelCount + allUpload.allFilesCount)) {
          $('.message-text').html();
          $('.message-text').html('File(s) uploaded successfully');
          $('.message-text').css('color', '#21bf73');
          setTimeout(function () {
           // location.reload();
          }, 1000);
        } else {
         // location.reload();
        }
      }, 2000);
    } else {
      $('.message').css('display', 'block');
      $('.message-text').html('File(s) uploaded successfully');
      $('.message-text').css('color', '#21bf73');
      setTimeout(function () {
        $('.loading').toggleClass('inactive');
        $('.message').css('display', 'none');
        $('.table-hover').removeClass('inactive');
        $('.table-body').removeClass('inactive');
       // getAllFileData(folderId);
      }, 1000);
    }
  } else {
   // location.reload();
  }
}

async function uploadFile2(files) {
  // let files = $('#file-upload')[0].files;
  console.log('inside');
  let folderId = 0;
  let failure = 0;
  $('.no-files').css('display', 'none');
  $('.table-body').addClass('inactive');
  loading();
  if (currentInnerFolderId) {
    folderId = currentInnerFolderId;
  } else {
    if (currentFolderId) {
      folderId = currentFolderId;
    } else {
      folderId = await folderStructureCheck();
    }
  }
  let allUpload = await upload(files, folderId, failure);
  addCurrentUserToTeamFolder();
  if (allUpload.cancelCount == 0 || files.length != allUpload.cancelCount || files.length != allUpload.allFilesCount) {
    if (allUpload.allFilesCount > 0) {
      $('.message').css('display', 'block');
      $('.message-text').html('Please check the file name. The only allowed characters are & - _');
      setTimeout(function () {
        if (files.length != (allUpload.cancelCount + allUpload.allFilesCount)) {
          $('.message-text').html();
          $('.message-text').html('File(s) uploaded successfully');
          $('.message-text').css('color', '#21bf73');
          setTimeout(function () {
         //   location.reload();
          }, 1000);
        } else {
        //  location.reload();
        }
      }, 2000);
    } else {
      $('.message').css('display', 'block');
      $('.message-text').html('File(s) uploaded successfully');
      $('.message-text').css('color', '#21bf73');
      setTimeout(function () {
     
        $('.loading').toggleClass('inactive');
        $('.message').css('display', 'none');
        $('.table-hover').removeClass('inactive');
        $('.table-body').removeClass('inactive');
      //  getAllFileData(folderId);
      }, 1000);
    }
  } else {
   // location.reload();
  }
}
/*
 *
 * Functions for File Action buttons
 *
 */

function duplicateFilePopUp(element) {
  if (element.name == 'cancel') {
    buttonClicked = 'cancel';
  } else if (element.name == 'separate') {
    buttonClicked = 'separate';
  } else if (element.name == 'update') {
    buttonClicked = 'update';
  }
  $('.duplicate').css('display', 'none');
  $('.content').html('');
  if ($('.table-body').hasClass('active')) {
    $('.table-body').addClass('inactive')
    $('.loading').addClass('active');
  }
}

/*
 *
 * Workdrive Upload Functionality
 *
 */

async function workdriveUpload(file, fileType, fileName, folderId) {
  const access_tokenData = await ZOHO.CRM.FUNCTIONS.execute("accesstoken", {});
   let accessToken =  JSON.parse(access_tokenData.details.output).access_token;
  const formData = new FormData();
  formData.append("file", file);  
  formData.append("parent_id", folderId);
  formData.append("accessToken", accessToken);
  formData.append("fileName", fileName);


  
  try { 
    const response = await fetch('http://localhost:3000/uploadFileFromWorkdriveWidget', {
        method: 'POST', //https://mailmergeandworkdrive-1.onrender.com/
        body: formData,
    });

    const result = await response.json();
    console.log('result::'+result);
    return result;
    
} catch (error) {
    console.error('Error uploading file:', error);
}
}

/*
 *
 * Array of Files Upload
 *
 */

async function upload(files, folderId, failure) {
  let filesArr = Array.from(files);
  let cancelCount = 0;
  // let format = /[^+\=\[\]{};\\<>\/?~]/;
  let format = /[`^+\=\[\]{};"\\<>\/]/;
  let splChar = 0;
  let allFilesCount = 0;
  for (let i = 0; i < filesArr.length; i++) {
    let el = filesArr[i];
    let fileNameInput;
    if (el.name.includes('_') && format.test(el.name) != true && el.name.match(".*[a-zA-Z]+.*") != null) {
      fileNameInput = escape(el.name).replace('_', '%5f');
    } else if (format.test(el.name) != true && el.name.match(".*[a-zA-Z]+.*") != null) {
      fileNameInput = escape(el.name);
    } else {
      splChar = i + 1;
      allFilesCount = i + 1;
    }
    if (splChar == 0) {
      let dataUpload = {
        "VARIABLES": {
          "file_name": String(fileNameInput),
          "parent_id": String(folderId).trim()
        },
        "CONTENT_TYPE": "multipart",
        "PARTS": [{
          "headers": {
            "Content-Disposition": 'form-data; name="content"; filename=' + fileNameInput + ';',
            "Content-Type": el.type
          },
          "content": "__FILE__"
        }],
        "FILE": {
          "fileParam": "content",
          "file": el
        },
      }
      console.log('el'+el);
      let data = await workdriveUpload(el, el.type, fileNameInput, folderId);
      let result;
      let fileId;
      console.log(JSON.stringify(data));
       if (Number(data.status_code) == 200) {
        $('.table-body').addClass('inactive');
        result = data.Data.attributes;
        fileId = result.resource_id;
        let fileName = '';
        if(result.FileName == undefined){
          fileName = result.file_name
        }else{
          fileName = result.FileName
        }
        if (fileName.includes('%')) {
          const func_name = "renameworkdrivefolderandfiles";
      const req_data = {
        "arguments": JSON.stringify({
          "name":  el.name,
          "resource_Id": fileId
        })
      };
     ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(function (data){
      location.reload();
     });
        }else{
      location.reload();
        }
      }
    }
    splChar = 0;
  }
  return new Promise((resolve, reject) => {
    resolve({ msg: 'Files Uploaded', cancelCount: cancelCount, splChar: splChar, allFilesCount: allFilesCount });
  });
}

/*
 *
 * Loading Icon Toggle
 *
 */

function loading() {
  $('.loading').toggleClass('active');
}


/*
 *
 * Folder Path navigation
 *
 */

function goToFolder(el) {
  let folderId, folderName, index, allItems, toBeRemovedItems;
  folderId = $(el).attr('data-folder-id');
  folderName = $(el).attr('data-folder-name');
  index = $(el).attr('data-index');

  allItems = $('.folder-path-list li').get();
  toBeRemovedItems = ''

  allItems.forEach(el => {
    if (Number($(el).attr('data-index')) > Number(index)) {
      if (toBeRemovedItems != '') {
        toBeRemovedItems = toBeRemovedItems + ', #' + $(el).attr('id')
      } else {
        toBeRemovedItems = '#' + $(el).attr('id');
      }
    }
  });

  $(toBeRemovedItems).remove();


  $('.folder-path-list li:last-child').removeClass('folder-name-text');
  $('.folder-path-list li:last-child').addClass('last-folder-name-text');


  $('.table-body').addClass('inactive');
  $('.table-body').html('');
  $('.no-files').addClass('inactive');
  loading();

  data = {
    "folder_id": String(folderId).trim(),
  }
  ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
    "method": "GET",
    "headers": { "Accept": "application/vnd.api+json" },
    "url": "https://www.zohoapis.com/workdrive/api/v1/files/" + String(folderId).trim()+"/files"
  })
    .then(function (response) {
      let result = response.details.statusMessage;
      allFilesAndFolders = result.data;
      allFiles = result.data;
      noFile(allFilesAndFolders, true);
    })

  // ZOHO.CRM.CONNECTOR.invokeAPI(apiList.getFilesAndFolders, data)
  //   .then(function (response) {
  //     let result = JSON.parse(response.response);
  //     allFilesAndFolders = result.data;
  //     noFile(allFilesAndFolders, true);
  //   })
}

/*
 *
 * Each File or Folder Click action
 *
 */
let innerFolder = '';
async function pop(el) {
  window.alert = function () { };
  if ($(el).attr('data-type') == 'folder') {
    let allFilesAndFolders, folderId, data, folderName;

    pageNumber = 1;

    $('.table-body').addClass('inactive');
    $('.table-body').html('');
    loading();
    folderId = $(el).attr('data-folder-id');
    folderName = $(el).attr('data-text');
    // console.log('folderName::'+folderName);
    // if(folderName == 'Submittals'){
    //   innerFolder = 'Submittals';
    // }else if(folderName == 'RFIs'){
    //   innerFolder = 'RFIs';
    // }else if(folderName == 'Change Orders'){
    //   innerFolder = 'Project_Change_Orders';
    // }else if(folderName == 'Daily Work Reports'){
    //   innerFolder = 'Project_Address';
    // }else if(folderName == 'Subcontractors'){
    //   innerFolder = 'Subcontractors13';
    // }else if(folderName == 'Quote'){
    //   innerFolder = 'Quotes';
    // }else if(folderName == 'Invoices'){
    //   innerFolder = 'Bills';
    // }else if(folderName == 'Purchase Orders'){
    //   innerFolder = 'Purchase_Orders';
    // }else if(folderName == 'Vendors'){
    //   innerFolder = 'Vendors18';
    // }
    // // If there is any checkbox checked while clicking on the folder, unchecking all the checkboxes
    // $('.box').each((i, el) => {
    //   $(el).prop('checked', false);
    // });
    // if(crmModuleName == 'Deals' && innerFolder !=''){
    //   console.log('innner::'+innerFolder);
    //   let relatedSubmittals = await ZOHO.CRM.API.getRelatedRecords({ Entity: crmModuleName, RecordID: crmRecordId, RelatedList: innerFolder });
    //   console.log('Test::'+JSON.stringify(relatedSubmittals));
    //   if (relatedSubmittals != undefined) {
    //    if (relatedSubmittals.statusText != "nocontent") {
    //      relatedSubmittals.data.forEach(eachRecord=>{
    //       if(innerFolder == 'Quotes'){
    //         if(eachRecord.Quote_Number == folderName){
    //           folderId = eachRecord.Workdrive_Id;
    //           // innerFolder = '';
    //         }
    //       }else if(innerFolder == 'Bills'){
    //         if(eachRecord.Invoice_Number == folderName){
    //           folderId = eachRecord.Workdrive_Id;
    //           // innerFolder = '';
    //         }
    //       }else if(innerFolder == 'Vendors18'){
    //         if(eachRecord.Vendor_Name == folderName){
    //           folderId = eachRecord.Workdrive_Id;
    //           // innerFolder = '';
    //         }
    //       }else{
    //         if(eachRecord.Name == folderName){
    //         folderId = eachRecord.Workdrive_Id;
    //         // innerFolder = '';
    //       }
    //     }
    //      })
    //    }
    //  }
    //  }
     
    // If the delete and download button is enabled while clicking on a folder, hide those buttons and show upload, new folder and new file buttons
    $('.download').css('display', 'none');
    $('.delete').css('display', 'none');
    $('.rename').css('display', 'none');
    $('.upload').css('display', 'block');
  $('.upload').css('margin-left', '7%');
    $('.new-folder').css('display', 'block');
  $('.new-folder').css('margin-left', '7%');

    $('.new-file').css('display', 'block');
    $('.btn-delete').attr('disabled', 'true');
    $('.file-rename-btn').attr('disabled', 'true');
    $('.download-btn').attr('disabled', 'true');


    // Load folder path according to the folder structure    
    let lastChild = $('.folder-path-list li:last-child');
    let lastChildClassName = lastChild[0].className;
    console.log('testing:'+lastChild[0].className);
    let listSize = $('.folder-path-list li').length;
    if (lastChildClassName == 'last-folder-name-text') {
      lastChild.removeClass('last-folder-name-text');
      lastChild.addClass('folder-name-text');
      let html = `<li class="arrow" data-index="${listSize}" id="index${listSize}"> > </li><li class="last-folder-name-text" data-folder-id="${folderId}" id="index${listSize + 1}" data-index="${listSize + 1}" data-folder-name="${folderName}" onclick="goToFolder(this);">${folderName}</li >`;
      $('.folder-path-list').append(html);
    } else if (lastChildClassName == 'home-icon') {
      let html = `<li class="last-folder-name-text" id="index${listSize}" data-folder-id="${folderId}" data-index="${listSize}" data-folder-name="${folderName}" onclick="goToFolder(this);">${folderName}</li >`;
      $('.folder-path-list').append(html);
    }


    currentInnerFolderId = folderId;
    data = {
      "folder_id": folderId.trim(),
    }
     ZOHO.CRM.CONNECTION.invoke("zohoconnection", {
      "method": "GET",
      "headers": { "Accept": "application/vnd.api+json" },
      "url": "https://www.zohoapis.com/workdrive/api/v1/files/" + folderId.trim()+"/files"
    })
      .then(function (response) {
        let result = response.details.statusMessage;
        allFilesAndFolders = result.data;
        allFiles = result.data;
        noFile(allFilesAndFolders, true);
      })
  } else if ($(el).attr('data-type') == 'zohosheet' || $(el).attr('data-type') == 'zohoshow' || $(el).attr('data-type') == 'writer') {
    $(el).attr('href', $(el).attr('data-native-file').trim());
    $(el).attr('target', '_blank');
  } else {
    console.log("$(el)::"+$(el));
    $('#modal-container').css('display', 'block');
    $('#thumbnail-img').attr('src', $(el).attr('data-img'));
    $('#caption').html($(el).attr('data-text'));
    $('.redirect-workdrive').attr('data-link', $(el).attr('data-img'));
  }
}


/*
 *
 * Open the current File
 *
 */

function goToWorkdrive(element) {
  window.open(element.dataset.link, "_blank");
  
  //location.reload();
}


/*
 *
 * Close Preview Pop Up
 *
 */

function closePop() {
  $('#modal-container').css('display', 'none');
  $('#thumbnail-img').attr('src', '');
  $('.center-block').css('display', 'block');
}

/*
 *
 * Helper Function to identify Folder or File / to handle writer, sheet and show files
 *
 */

Handlebars.registerHelper('fileOrFolderIcon', function (type) {
  let fileType = Handlebars.Utils.escapeExpression(type);
  let result;
  if (fileType == 'folder') {
    result = new Handlebars.SafeString('<i class="fas fa-folder"></i>');
  } else if (fileType == 'writer') {
    result = new Handlebars.SafeString('<img src="../images/zoho_writer.png" alt="zoho_writer" width="5" height="5">');
  } else if (fileType == 'zohosheet') {
    result = new Handlebars.SafeString('<img src="https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_9c567b35041b92829304b1f0deab3d8a/zoho-sheet.png" alt="zoho_sheet" width="5" height="5">');
  } else if (fileType == 'zohoshow') {
    result = new Handlebars.SafeString('<img src="../images/zoho_show.png" alt="zoho_show" width="5" height="5">');
  } else {
    result = new Handlebars.SafeString('<i class="fas fa-file"></i>');
  }
  return result;
});

Handlebars.registerHelper('thumbnailUrl', function (url, options) {
  if (url != '') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('shortenName', function (name, options) {
  let fileName = Handlebars.Utils.escapeExpression(name);
  console.log('name::'+name);
  let result;
  if (name.length > 55) {
    result = new Handlebars.SafeString(name.substring(0, 30) + '...');
  } else {
    result = new Handlebars.SafeString(name);
  }
  return result.toString();
});

Handlebars.registerHelper('nativeZohoFilesUrl', function (type, options) {
  if (type == 'folder') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});


/*
 *
 * Initial Record Info Fetch
 *
 */

async function fetchRecordInfo(data) {
  let getRecord, searchRecords, folderIdExistsInAnotherRecord, crmRecordUpdate, result;
  getRecord = await ZOHO.CRM.API.getRecord({ Entity: data.Entity, RecordID: data.EntityId })
  console.log('data::'+JSON.stringify(getRecord));
  loading();
  //If the record is waiting for approval, it is not possible to get the record info. Need to lock the related list and show a message to the user to come back after record approval
  if (getRecord.statusText == "nocontent") {
    main({}, false, true);
  } else {
    result = getRecord.data[0];
    crmRecordInfo = getRecord.data[0];
    if (result.Workdrive_Id == null) {
      main({}, true, true);
    } else {
      searchRecords = await ZOHO.CRM.API.searchRecord({ Entity: crmModuleName, Type: "criteria", Query: "(Workdrive_Id:equals:" + result.Workdrive_Id + ")", delay: false, converted: "both", approved: "both" });
      folderIdExistsInAnotherRecord = false;
      if (searchRecords.statusText != "nocontent") {
        for (let i = 0; i < searchRecords.data.length; i++) {
          if (searchRecords.data[i].id != crmRecordId) {
            folderIdExistsInAnotherRecord = true;
            break;
          }
        }
      }

      if (folderIdExistsInAnotherRecord) {
        crmRecordUpdate = await ZOHO.CRM.API.updateRecord({ Entity: crmModuleName, APIData: { id: crmRecordId, Workdrive_Id: "", Workdrive_URL: "" } });
        main({}, true, true);
      } else {
        recordFolderIdGlobal = result.Workdrive_Id;
        currentFolderId = recordFolderIdGlobal;
        recordData = result;

        main(result);
      }
    }
  }
}


/*
function fetchRecordInfo(data) {
  ZOHO.CRM.API.getRecord({
    Entity: data.Entity,
    RecordID: data.EntityId
  })
    .then(function (response) {
      loading();
      //If the record is waiting for approval, it is not possible to get the record info. Need to lock the related list and show a message to the user to come back after record approval
      if (response.statusText == "nocontent") {
        main({}, false, true);
      } else {
        let result = response.data[0];
        crmRecordInfo = response.data[0];
        if (result.Workdrive_Id == null) {
          main({}, true, true);
        } else {
          recordFolderIdGlobal = result.Workdrive_Id;
          currentFolderId = recordFolderIdGlobal;
          main(result);
        }
      }
    });
}
*/


// Custom Code
async function searchWorkdriveFolder(folder_id,search_term){

  var conn_name = "zohoconnection";
  var req_data ={
    "headers" : { 
          "Accept" : "application/vnd.api+json"
      },
    "method" : "GET",
    "url" : `https://www.zohoapis.com/workdrive/api/v1/teams/${orgVariables.parentId}/records?search%5Ball%5D=${search_term}&filter%5BparentId%5D=${folder_id}&page%5Blimit%5D=200&page%5Boffset%5D=0`,
    "param_type" : 1
  };
  var res=await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data);
  console.log('res::'+JSON.stringify(res));
  return res;
}

async function viewWorkdriveFiles(folder_id){

  var conn_name = "zohoconnection";
  var req_data ={
    "headers" : { 
          "Accept" : "application/vnd.api+json"
      },
    "method" : "GET",
    "url" : `https://www.zohoapis.com/workdrive/api/v1/teams/${orgVariables.parentId}/records?&filter%5BparentId%5D=${folder_id}&page%5Blimit%5D=200&page%5Boffset%5D=0`,
    "param_type" : 1
  };
  var res=await ZOHO.CRM.CONNECTION.invoke(conn_name, req_data);
  var dataResp=res.details.statusMessage.data;
  return dataResp.filter((e)=>{
    return e.attributes.is_folder==false && e.attributes.extn!="eml"
  });
}

function triggerDeleteFileOrFolder(){
  console.log('deleteFileOrFolder');
  let checkedBoxes = $('input:checked');
  console.log('deleteFileOrFolder'+checkedBoxes.length);

  checkedBoxes.each((i, el) => {
    if (el.name != 'header-box') {
      let id = el.dataset.id;
      const func_name = "deletefolderfromworkdrive1";
      const req_data = {
        "arguments": JSON.stringify({
          "fileId": id,
          "functionForDelete": "For_Delete",
          "FolderName":''
        })
      };
     ZOHO.CRM.FUNCTIONS.execute(func_name, req_data).then(function (data){
      location.reload();
     });
    }
  });
}

//Delete file or folder
function deleteFileOrFolder() {
  $('#renameModal').modal({
    backdrop: false
  });
  $('#renameModal').modal("toggle")
  document.getElementById("showIfRenameClick").style.display="none";
  document.getElementById("renameInputdiv").style.display="none";
  document.getElementById("showIfDeletConfirmatiom").style.display="block";
  document.getElementById("fordelete").style.display="inline-block";
  document.getElementById("showIfDeletConfirmatiom").style.marginBottom="11%";

  document.getElementById("forSave").style.display="none";
}

function sortByColumn(column_name,type,element){
  var ret=type=="desc"?1:-1;
  var sortedFileList=[];
  $(element).addClass("bg-secondary text-white");

  if(column_name=="created_by"){
    sortedFileList=allFiles.sort((a,b)=>{
        let fa=a.attributes.created_by.toLowerCase(),
            fb=b.attributes.created_by.toLowerCase();
        if (fa < fb) {
            return -ret;
        }
        if (fa > fb) {
            return ret;
        }
        return 0;
    })
  }
  if(column_name=="modified_by"){
    sortedFileList=allFiles.sort((a,b)=>{
        let fa=a.attributes.modified_by.toLowerCase(),
            fb=b.attributes.modified_by.toLowerCase();
        if (fa < fb) {
            return -ret;
        }
        if (fa > fb) {
            return ret;
        }
        return 0;
    })
  }
  if(column_name=="created_time"){
    sortedFileList=allFiles.sort((a,b)=>{
      let fa=a.attributes.created_time_in_millisecond,
          fb=b.attributes.created_time_in_millisecond;
        if (fa < fb) {
            return -ret;
        }
        if (fa > fb) {
            return ret;
        }
        return 0;
    })
  }
  if(column_name=="modified_time"){
    sortedFileList=allFiles.sort((a,b)=>{
        let fa=a.attributes.modified_time_in_millisecond,
            fb=b.attributes.modified_time_in_millisecond;
        if (fa < fb) {
            return -ret;
        }
        if (fa > fb) {
            return ret;
        }
        return 0;
    })
  }
  if(column_name=="size"){
    sortedFileList=allFiles.sort((a,b)=>{
        let fa=a.attributes.storage_info.size_in_bytes,
            fb=b.attributes.storage_info.size_in_bytes;
        if (fa < fb) {
            return ret;
        }
        if (fa > fb) {
            return ret;
        }
        return 0;
    })
  }
  if(column_name=="name"){
    sortedFileList=allFiles.sort((a,b)=>{
        let fa=a.attributes.name.toLowerCase(),
            fb=b.attributes.name.toLowerCase();
        if (fa < fb) {
            return -ret;
        }
        if (fa > fb) {
            return ret;
        }
        return 0;
    })
  }
  return sortedFileList;

}
var currentSorted={"col":"name","type":"desc"};

$(document).on("click",".sortCol",function(e){
  currentSorted["col"]=$(this).data("sort_name");
  currentSorted["type"]= currentSorted["type"]=="desc"?"asc":"desc";
  $(".sortCol").removeClass("bg-secondary text-white");

  noFile(sortByColumn(currentSorted["col"],currentSorted["type"],this),true);
});

$(document).on("click",".filterCol",function(e){
  var personList=[];
  var dpm=$(this).parent().find(".dropdown-menu");
  dpm.html("");
  allFiles.forEach(ele=>{
  if(personList.includes(ele.attributes[$(this).data("filter_col")])){
    return 1;
  }
  personList.push(ele.attributes[$(this).data("filter_col")]);
  dpm.append(`<a class="dropdown-item filterByPerson" data-filter_col="${$(this).data("filter_col")}" data-filter_by_person="${ele.attributes[$(this).data("filter_col")]}" href="#">${ele.attributes[$(this).data("filter_col")]}</a>`)

 })
});

$(document).on("click",".filterByPerson",function(e){
  var ret=allFiles.filter(ele=>{
    return ele.attributes[$(this).data("filter_col")]==$(this).data("filter_by_person");
  })
  noFile(ret,true,false,true);

})


function onFileDrop(ev){
  
  ev.preventDefault();
  var f=[]
  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile();
        f.push(file);
        console.log(`… file[${i}].name = ${file.name}`);
      }
      
    })
    uploadFile2(f);
  } else {
    // Use DataTransfer interface to access the file(s)
    uploadFile2([...ev.dataTransfer.files])
  }

}

$(document).on("dragenter","body",function(ev){
    $("body").addClass("bg-light");
    $("body").css({"border":"5px dashed #339DFF"});

})

$(document).on("dragover","body",function(ev){

  ev.preventDefault();
})
$(document).on("dragleave","body",function(ev){
  $("body").removeClass("bg-light");
  $("body").css({"border":"none"});

  ev.preventDefault();

});

let currentView="all_files";

function toggleAllFileView(){
  if(currentView=="all_files"){
    $(".show-all-files").css({"display":"none"});
    viewAllFiles();
  }else{
   // location.reload();
  }
}


/*
 * Initialise the Widget
 */

// popup Message
//Popup for success and error for send and save
function showPopup(message, type) {
  const popup = document.getElementById('popup');
  const messageElement = document.getElementById('popup-message');

  // Set message text
  messageElement.textContent = message;

  // Remove existing classes and add the appropriate one
  popup.className = 'popup'; // Reset classes
  popup.classList.add(type); // Add success or error class
  if (type == 'error') {
    popup.style.width = '272px';
  }

  // Show popup
  popup.style.display = 'block';

  // Automatically close the popup after 4 seconds
  setTimeout(() => {
    popup.style.display = 'none';
  }, 4000); // 4000 milliseconds = 4 seconds
}


ZOHO.embeddedApp.init();
