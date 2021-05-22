//Create HTML for the person who cut from image
function htmlBestMatch(fullname, age, gender, typeCrime, typeWanted, url) {
    return `<div class="row info">
            <div class="col-xl-4  ">
                <img class="img-extracted" id="image_${fullname}" src="${url}" alt="Extracted Image">
            </div>
            <div class="col-xl-5 ">
                <table class="table-info table-bordered table-sm">
                    <tbody class="tbody-info">
                        <tr>
                            <th colspan="4" class="noborder text-muted">Information</th>
                        </tr>
                        <tr>
                            <th>Name</th>
                            <td>
                                <a id="name">${fullname}</a>
                            </td>
                        </tr>
                        <tr>
                            <th>Age</th>
                            <td>
                                <a id="age">${age}</a>
                            </td>
                        </tr>
                        <tr>
                            <th>Gender</th>
                            <td>
                                <a id="gender">${gender}</a>
                            </td>
                        </tr>
                        <tr>
                            <th>Type Crime</th>
                            <td><a>${typeCrime}</a></td>
                        </tr>
                        <tr>
                            <th>Type Wanted</th>
                            <td><a>${typeWanted}</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`;
}

//Create HTML for 4 person who has the best similarity with best match
function htmlSimilarityWithBestMatch(fullname, gender, dob, typeCrime, nationality, url, placeOfResidence, ratio, scopeWanted) {
    var string = fullname.replace(/\s/g, '');
    return `<div class="col-md-3">
            <div class="custom-box">
                <img id="img_${fullname}" src="${url}" alt="compare face">
                <div class="form-ratio-face">
                    <a id="name">${fullname}</a>
                    <div class="progress-bar horizontal">
                        <div class="progress-track">
                            <div id="progress_${fullname}" style="width:${ratio}%" class="progress-fill">
                                <span id="ratio_${fullname}">${ratio}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail">
                        <p class="p_detail">Detail</p>
                        <a class="icon">
                            <i class="fa fa-angle-double-down" aria-hidden="true" style="font-size:18px" data-bs-toggle="modal" data-bs-target="#data_${string}"></i>
                        </a>

                        <!-- Modal -->
                        <div class="modal fade" id="data_${string}" data-bs-backdrop="false" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content" style="width:550px;">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="staticBackdropLabel">Information
                                        </h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <table class="table-detail table-bordered table-sm">
                                            <tbody class="tbody-detail">
                                                <tr>
                                                    <th class="th-first">Name</th>
                                                    <td>
                                                        <a id="nameDetail_${fullname}">${fullname}</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th class="th-first">Gender</th>
                                                    <td>
                                                        <a id="genderDetail_${fullname}">${gender}</a>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th class="th-first">Place Of Birth</th>
                                                    <td>
                                                        <a id="pBirthDetail_${fullname}">${dob}</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th class="th-first">Nationality</th>
                                                    <td><a id="nationalityDetail_${fullname}">${nationality}</a></td>
                                                </tr>
                                                <tr>
                                                    <th class="th-first">Place Of Residence</th>
                                                    <td>
                                                        <a id="pResidenceDetail_${fullname}">${placeOfResidence}</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th class="th-first">Type Crime</th>
                                                    <td>
                                                        <a id="typeCrimeDetail_${fullname}">${typeCrime}</a>
                                                    </td>
                                                </tr>
                                                <th class="th-first">ScopeWanted</th>
                                                <td>
                                                    <a id="scopeWantedDetail_${fullname}">${scopeWanted}</a>
                                                </td>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function htmlFramesSimilarity(similarity) {
    return `<hr style="margin-top: 70px; margin-bottom: 70px;">
            <h2 class="title-h2">Similarity faces</h2>
            <div class="container" style="margin-bottom: 140px;">
                <div class="row" id="similarity">
                    ${similarity}
                </div>
            </div>`;

}