$("document").ready(function() {
//=========================================================================
    // Alias
    const dureeCourse = $("#dureeCourse");
    const divListeAnimaux = $("#divListeAnimaux");
    const divListeInscrits = $("#divListeInscrits");
    const txtNomCourse = $('#txtNomCourse');
    const txtDescCourse = $('#txtDescCourse');

    // Variables
    let idCourse;
    let idAnimal;
    let temps;
    let statut;

    let sup;

    //-------------------------------------------------------

    // Event
    $(divListeAnimaux).on("click", "#btnIns" , function(){
        inscrire();
    });

    $(document).on("click", "#btnSup", function(){
        sup = "" + $(this).parent().attr('id');
        $('#selectAnimaux option[value=' + sup + ']').prop('disabled', false);
        $(this).parent().remove();
    });

    $(document).on("click", "#btnClotIns", function(){
        cloture();
        $('*#btnSup').remove();
    });

    $(divListeAnimaux).on("click", "#btnStart" , function(){
        start();
    });

    $(divListeInscrits).on("click", "#btnStop" , function(){
        idAnimal = $(this).parent().attr('id');
        statut = 'T';
        temps = $('#txtTimer').val();

        $(this).before($("<label>", { id: "txtStop",text: $('#txtTimer').val() }));
        insertResultat();
        $(this).next().remove();
        $(this).remove();
    });

    $(divListeInscrits).on("click", "#btnAbandon" , function(){
        idAnimal = $(this).parent().attr('id');
        statut = 'A';
        temps = $('#txtTimer').val();

        $(this).after($("<label>", { id:"txtAbandon" ,text: 'ABANDON' }));
        insertResultat();
        $(this).prev().remove();
        $(this).remove();
    });

    //-------------------------------------------------------
    affListePays();
    affDuree();
    verifInput();

    // Ajoute le pays à la SELECT Pays
    function affListePays() {
        let listePays = $.ajax({
            url: "./db/rqListePays.php",
            dataType: "json",
            async: false
        }).done(function(nomP) {
            for (let pays of nomP) {
                $("#selectPays").append(
                    $("<option>", {
                        value: pays.codeP,
                        text: pays.nomP
                    })
                );
            }
        }).responseJSON;
    }

    //-------------------------------------------------------

    // Interdit l'écriture d'un caractère autre qu'un chiffre
    function affDuree() {
        dureeCourse.keyup(function() {
            let input = $(this).val();
            let regex = new RegExp("^[0-9|,|.|:]+$");
            if (!regex.test(input)) {
                $(this).val(input.substr(0, input.length-1));
                alert("Uniquement des chiffres svp");
            }
        });
    }

    //-------------------------------------------------------

    // Vérification des champs
    function verifInput() {
        $('#btnComIns').click(function(){
            if(txtNomCourse.val() === '' || txtDescCourse.val() === '' || dureeCourse.val() === '' || dureeCourse.val() === '0'){
                alert('Veuillez ne pas laisser les champs vides !');
            }
            else {
                insertCourse();
                comInscription();
            }
        });
    }

    //-------------------------------------------------------

    // Inscription
    function comInscription() {
        txtNomCourse.prop('disabled', true);
        txtDescCourse.prop('disabled', true);
        dureeCourse.prop('disabled', true);
        $("#selectPays").prop('disabled', true);
        $("#btnComIns").remove();

        $.ajax({
            url: "./db/rqListeAnimaux.php",
            method: "GET",
            async: true,
            dataType: "json"
        }).done(function(nomA) {
            divListeAnimaux.empty();
                divListeAnimaux
                    .append($("<label>", { text: "Choississez un animal:" }))
                    .append($("<select>", { id: "selectAnimaux" }))
                    .append($("<input>", { type: "button", value: "Inscrire", id: "btnIns" }))
                    .append($("<input>", { type: "button", value: "Cloturer les inscriptions", id: "btnClotIns" }));
            $("#selectAnimaux").append(
                $("<option>", {
                    value: "",
                    text: "---"
                })
            );
            let i = 0;
            for (let animal of nomA) {
                $("#selectAnimaux").append(
                    $("<option>", {
                        value: animal.idA,
                        idx: i,
                        text: animal.nomA
                    })
                );
                i++;
            }
        }); //$.ajax
    }

    //-------------------------------------------------------

    // Ajouter un animal à la course
    function inscrire() {
        $.ajax({
            url: "./db/rqListeAnimaux.php",
            method: "POST",
            async: true,
            dataType: "json"
        }).done(function(response) {
            let animalValue = $('#selectAnimaux option:selected');
            console.log(animalValue.val());
            let animal = response[animalValue.attr('idx')];
            console.log(animal);
                divListeInscrits
                    .append($("<div>", { id:animal.idA }));
                $('div#' + animal.idA)
                    .append($("<input>", { type: "button", value: "Supprimer", id: "btnSup" }))
                    .append($("<label>", { text: animal.idA }))
                    .append($("<label>", { text: animal.nomA }))
                    .append($("<label>", { text: animal.nationA }))
                    .append($("<label>", { text: animal.descA }))
                    .append($("<br>"));
            // idAnimal = animal.idA;
            animalValue.prop("disabled", true);
        }); //$.ajax
    }

    //-------------------------------------------------------

    // Supprimer un animal de la course
    function supInscrit() {
        // let animalValue = $('#selectAnimaux').find('option:selected');
        // let animalValue = $('#selectAnimaux').find('option:' + sup);
        let animalValue = $('#selectAnimaux option[value=sup]')
        // let animalValue = $('#selectAnimaux').find('option');
        // alert(sup);
        animalValue.prop("disabled", false);
    }

    //-------------------------------------------------------

    // Ajoutes les prochains boutons
    function cloture() {
        divListeAnimaux.empty();
        $("*#btnSup")
            .before($("<input>", { type: "button", value: "STOP", id: "btnStop", disabled: true }))
            .before($("<input>", { type: "button", value: "Abandon", id: "btnAbandon", disabled: true }));

        divListeAnimaux
            .append($("<input>", { type: "button", value: "Start", id: "btnStart" }))
            .append($("<input>", { type: "text", value: "00:00:00", id: "txtTimer" }))
            .append($("<label>", { text: "tps restant:" }))
            .append($("<input>", { type: "text", value: "00:00:00", id: "txtCountdown" }));
    }

    //-------------------------------------------------------

    // Start le timer et le countdown
    function start() {
        let time = dureeCourse.val();
        alert("La course a commencé !");
        $("#txtTimer").timer({
            duration: time + 's',
            format: '%H:%M:%S',
        });

        $("#txtCountdown").timer({
            countdown: true,
            duration: time + 's',
            format: '%H:%M:%S',
            callback: function() {
                alert('Course terminé !');
            }
        });
        $("#btnStart").prop("disabled", true);
        $("*#btnStop").prop("disabled", false);
        $("*#btnAbandon").prop("disabled", false);
    }

    //-------------------------------------------------------

    // Insérer dans la DB une nouvelle course
    function insertCourse() {
        let nom  = txtNomCourse.val();
        let desc = txtDescCourse.val();
        let date = new Date();
        date = date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
        let lieu = $('#selectPays').find('option:selected').val();

        let course = {
            nomC: nom,
            lieuC: lieu,
            descC: desc,
            dateC: date,
        };

        $.ajax({
            type: "POST",
            url: "./db/rqInsertCourse.php",
            async: true,
            data: {
                course: JSON.stringify(course)
            }
        }).done(function (courseId) {
            console.log("course : " + courseId);
            console.log("DATA DONE");
            idCourse = courseId;
        });
    }

    //-------------------------------------------------------

    // Insérer dans la DB les résultat de la course
    function insertResultat() {

        let resultat = {
            idC: idCourse,
            idA: idAnimal,
            temps: temps,
            statut: statut,
        };

        $.ajax({
            type: "POST",
            url: "./db/rqInsertResultat.php",
            async: true,
            data: {
                resultat: JSON.stringify(resultat)
            }
        }).done(function (resultatId) {
            console.log("resultat : " + resultatId);
            console.log("DATA DONE");
        });

    }

    //=========================================================================
}); //$('document').ready(function(){

