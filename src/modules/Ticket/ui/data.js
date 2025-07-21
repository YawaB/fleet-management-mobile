
const CSS = `
.shadow-box {
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .2), 0 2px 4px 0 rgba(0, 0, 0, .2);
}

:root {
    font-family: Poppins, Helvetica, sans-serif;

    background-image: none !important;
    --bg-blue: #28306E !important;
    --bg-orange: #F78D20;
    --success-color: #28a745;
    --primary-color: #007bff;
    --secondary-color: #7f95a2;
    --warning-color: #ffc107;
    ;
    --warning-color-secondary: rgb(238, 195, 6);
    --info-color: #17a2b8;
    --dark-color: #343a40;
    --info-color-secondary: #9005bb;
    --danger-color: #dc3545;
    --danger-color-secondary: #f11616;
    --default-color: #ebedf3;

}

.d-inline-block {
    display: inline-block;
}

.app-orange {
    background-color: #F78D20 !important;
    color: white;
}

.app-blue {
    background-color: #28306E !important;
}

.app-bg-gradiant {
    background-image: linear-gradient(145deg, #28306E, #F78D20) !important;
}

.app-color-blue {
    color: #28306E !important;
}

.app-color-orange {
    color: #F78D20 !important;
}

@keyframes toTop {
    from {
        bottom: -10px;
    }

    to {
        bottom: 0;
    }
}

.animeMooveTop {
    position: relative;
    animation: toTop 1s ease;
}

.d-flex-1 {
    display: flex;
    width: 100%;
}


.dash-item {
    min-width: 44%;
    /* max-width: 44%; */
    /*margin:10px;*/
    text-align: center;
    padding: 10px;
    max-height: 200px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2), 0 2px 4px 0 rgba(0, 0, 0, .2);
    position: relative;
}

.animate-to-right {
    animation: toRight 1s ease;
    -webkit-animation: toRight 1s ease;
}

.animate-to-left {
    animation: toleft 1s ease;
    -webkit-animation: toleft 1s ease;

}

.dash-item .icon {
    width: 80px;
    height: 80px;
    margin-bottom: 15px;
    display: inline-block;
    font-size: 80px;
}

.dash-item .fas {
    font-size: 80px;
    display: block;
    margin-bottom: 15px;
    color: var(--bg-orange)
}

.dash-item .title {
    font-weight: 500;
    font-size: 0.8rem;
    color: #181c32;
    text-transform: uppercase;
}


.v-dash-item {
    min-width: 44%;
    max-width: 44%;
    margin: 10px;
    text-align: center;
    padding: 10px;
    max-height: 200px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2), 0 2px 4px 0 rgba(0, 0, 0, .2);
    position: relative;
}

.v-dash-item .icon {
    width: 80px;
    height: 80px;
    margin-bottom: 15px;
    display: inline-block;
    font-size: 80px;
}

.v-dash-item .fas {
    font-size: 80px;
    display: block;
    margin-bottom: 15px;
    color: var(--bg-orange)
}

.v-dash-item .title {
    font-weight: 500;
    font-size: 0.8rem;
    color: #181c32;
    text-transform: uppercase;
}

@keyframes toRight {
    0% {
        left: -10px;

    }

    100% {
        left: 0px;

    }
}

@keyframes toleft {
    0% {
        right: -10px;
    }

    100% {
        right: 0px;
    }
}

.menu-box-right {
    display: block !important;
}

.border-bottom {
    border-width: 0 0 1px 0 !important;
    border-radius: 0 !important;
}

.red-theme {
    background-color: #ffb2b2 !important;
    color: #e50000 !important;
}

.blue-theme {
    background-color: #9999ff !important;
    color: #0000e5 !important;
}

.cyan-theme {
    background-color: #99ffff !important;
    color: #007f7f !important;
}

.bindi-theme {
    background-color: #b5cfd2 !important;
    color: #09555e !important;
}

.error-on-input {
    border-color: red !important;
}

.alive-btn {

    animation: alive 1.5s ease infinite;
    display: block;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    bottom: 75px !important;
    right: 10px !important;
    z-index: 5;
    float: right;


}

@keyframes alive {
    0% {
        transform: scale(1);
        -webkit-transform: scale(1);
    }

    50% {
        transform: scale(1.3);
        -webkit-transform: scale(1.1)
    }

    100% {
        transform: scale(1);
        -webkit-transform: scale(1);
    }
}

input,
textarea,
select {
    color: black !important;
}

/*
.picker {
    display: inline-block;
    vertical-align: middle;
    width: 100% !important;
}

.picker .pc-select {
    position: relative;
    display: inline-block;
    min-width: 165px;
    max-width: 100% !important;
    width: 100% !important;
    right: 0 !important;
}



.picker .pc-select .pc-list{
    z-index: 110;

}

.picker .pc-element, .picker .pc-trigger{
    border-width: 1px !important;
    border-color: rgba(0,0,0,.1) !important;
    border-radius: 0px !important;
    padding: 6px !important;
    padding-left: 10px !important;
}*/

.form-field span {
    position: static !important;
    right: 0px !important;
    font-size: 13px !important;
    opacity: 1 !important;
}

.select2-container--default .select2-selection--single {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, .1) !important;
    border-radius: 0px !important;
}

.select2-container .select2-selection--single {

    height: 37px !important;

}

.select2-container--default .select2-selection--single .select2-selection__arrow b {
    position: relative !important;
    left: 97% !important;
    top: -60% !important;
    border-top-color: black !important;
    display: none !important;
}

.select2-container--default .select2-selection--single .select2-selection__rendered {
    line-height: 35px !important;
    background-color: white !important;
}


.h-30 {
    height: 30px !important;

}

.h-50 {
    height: 50px !important;
}

.label {
    margin-bottom: 0 !important;
}


.v-input-error {
    border-width: 1px !important;
    border-style: solid !important;
    border-color: red !important
}

.v-error-text {
    color: red
}


/** dash with icon **/
.dash-item {
    background-color: white;
    border-radius: 5px;
    height: auto;
    min-height: 80px;
    background-color: #f6f8f7;
    overflow: hidden !important;
}

.dash-item .fas {
    font-size: 20px !important;
    width: 40px;
    height: 40px;
    vertical-align: middle;
    padding-top: 10px;
    margin-bottom: 0 !important;
}

.dash-item p {
    margin-bottom: 0;
}

.dash-item .dash-stat {
    color: #455a64;
    font-family: var(--bs-font-sans-serif);
    font-weight: 400;
    line-height: 1.2;

}

.dash-item .title {
    font-weight: 400;
    font-family: var(--bs-font-sans-serif);
    text-transform: none !important;
}

.dash-item.dash-item-customer::after {
    content: "";
    position: absolute;
    top: -15px;
    right: -10px;
    width: 10%;
    background-color: var(--default-color);
    height: 50px;
    z-index: 8;
    transform: rotate(139deg);
}

.dash-item.dash-item-customer.v-primary::after {
    background-color: var(--primary-color) !important;
}

.dash-item.dash-item-customer.v-danger::after {
    background-color: var(--danger-color) !important;
}

.dash-item.dash-item-customer.v-info::after {
    background-color: var(--info-color) !important;
}

.dash-item.dash-item-customer.v-success::after {
    background-color: var(--success-color) !important;
}

.dash-item.dash-item-customer.v-warning::after {
    background-color: var(--warning-color) !important;
}


.v-image-small-container {
    display: flex;
    flex-wrap: wrap;

}

.v-image-small-container .v-image-container {
    position: relative;
    height: 120px;
    width: 33.333%;
}

.v-image-container-50 {
    width: 50% !important
}

.v-image-container .v-delete-icon {
    position: absolute;
    right: 0px;
    top: 0px;
    color: var(--danger-color);
    font-size: 1.5rem;
    background-color: black;
    border-radius: 50%
}

.v-image-container .v-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: top;
}

.form-control:not([class*='bg-']),
input:not([class*='bg-']) {
    background-color: #fff !important;
    color: #000 !important;
}


.images-container {
    padding: 15px;
    border-radius: .2rem;
    background-color: rgb(221, 216, 216);
}

.images-container .images-container-content{
    background-color: rgb(171, 167, 167);
    width: 100px;
    height: 100px;
}
`

const header = `
<head><link rel="stylesheet" href="file:///android_asset/www/css/bootstrap.css"><link rel="stylesheet" href="file:///android_asset/www/css/app.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
<style>
 ${CSS}
</style>
// </head>
`

let content = `

`
export const HTML = `
${header}
${content}
`