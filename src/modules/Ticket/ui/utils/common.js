import mustache from "mustache"
import { printHtml } from "../../../../core/utils/util"

export async function exportTicketReport(reportData , ticket ){
    let isInventory = false //ticket?.ticketType?.code == 'inventory'
    let temp = `
        ${buildReportHeader(ticket)}
        {{#list}}
            <div class="rapportDV" style="margin-left:10px; margin-right:10px;margin-top: 80px  !important">
                    <div class="p-2" style="background-color:#6b7280;color: white;padding-top:8px;padding-bottom:8px">{{label}}</div>
                    <table class="table table-bordered" style="border: 1px solid #dee2e6;    width: 100%; margin-bottom: 0.9375rem; color: #212529;max-width: 100%;overflow-y: scroll;">
                        <thead class="" style="background-color: #343a40 !important;color:white">
                            <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top">Libéle</td>
                            <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top">Valeur</td>
                            ${
                                isInventory ? `
                                <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top">Marque</td>
                                <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top">Quantité</td>
                                `: ''
                            }
                            <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top">Commentaire</td>

                        </thead>
                        <tbody class="tbody">
                            {{#items}}
                                <tr data-code="{{id}}" data-value="{{type}}">
                                    <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top;max-width:120px  !important">{{label}}</td>
                                    <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top;max-width:120px  !important;"><strong>{{value}}</strong></td>
                                    ${
                                    isInventory ? `
                                        <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top;max-width:120px  !important">{{label}}</td>
                                        <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top;max-width:120px  !important;"><strong>{{value}}</strong></td>
                                    `: ''
                                    }
                                    <td style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top;max-width:120px  !important;"><strong>{{comment}}</strong></td>

                                </tr>
                                <tr>
                                {{#hasImages}}
                                    <td colspan="${isInventory ? 5 : 3}" style="border: 1px solid #dee2e6;padding: 0.75rem;vertical-align: top">
                                        <div class="d-flex flex-wrap v-image-small-container p-1" >
                                                {{#images}}
                                                    <div  style="height: 160px !important; width: 50% !important"  class="v-image-container v-image-container-main p-2" >
                                                            <img src="{{path}}" class="v-image"  object="AuditEsco" style="object-fit: fill !important" action="viewPhoto" data="'{{id}}','{{.}}','{{name}}'">
                                                    </div>     
                                                {{/images}}
                                        </div>
                                    </td>
                                {{/hasImages}}
                                </tr>
                            {{/items}}
                        </tbody>
                    </table>
            </div>
        {{/list}}
    `
    reportData.forEach( o =>{
        if(!Array.isArray(o.items)) return
        o.items.forEach(t => {
            t.hasImages = t.images?.length > 0
        })
    })
    let html = mustache.render(temp , {list: reportData})
    return await printHtml(html)
}

let buildReportHeader = (ticket)=>{
    let temp = `
        <div class="shadow-3 bg-white p-3" style="margin: 20px 10px">
            <div class="card border-0" style="width: 100%;margin:5px auto;">
                <div class="card-content pb-1">
                    <div class="card-header" style="background-color: #28306E !important;padding: 15px 20px">
                        <div class="card-title text-white row" style="color: white; font-size: 25px;font-weight: bold;"> 
                        <div class="col-2"><span class="fas fa-file-pdf mr-1"></span></div> 
                        <div class="col-10 pl-0" style="line-height: 2rem;">
                            Rapport <span id="typeName">{{ticketType.label}} </span>
                            <div class="text-info" style="font-size: 15px ;">{{ referenc }}</div>
                        </div>  
                        </div>
                    </div>
                    <div class="card-body" style="border:1px solid var(--bg-blue); border-top-width: 0 ;padding:20px">
                        <div class=""> 
                            <div class="mb-2" style="margin-bottom:10px">
                                <span style="font-size:17px">
                                    <strong>Code du site:</strong> <span class="text-muted site-code-dv">{{ site.code }}</span>
                                </span>
                            </div>
                            <div class="mb-2" style="margin-bottom:10px">
                                <span style="font-size:17px">
                                    <strong>Nom du site:</strong> <span class="text-muted site-name-dv">{{ site.label }}</span>
                                </span>
                            </div>
                            <div class="mb-2" style="margin-bottom:10px">
                            <span style="font-size:17px">
                                <strong>Rélévé par:</strong> <span class="text-muted objectif" >{{ agent.fullname }}</span>
                            </span>
                            </div>
                            <div class="mb-2" style="margin-bottom:10px">
                            <span style="font-size:17px">
                                <strong>A la date du:</strong> <span class="text-muted date-dv" > {{ date }}</span>
                            </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
    return mustache.render(temp , ticket)
}
