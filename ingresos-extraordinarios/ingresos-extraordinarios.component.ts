import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { Data } from '@angular/router';
import { DeudaService } from './deuda.service';
import { PersonasService } from './personas.service';
import { Personas } from './personas.model';
import Swal from 'sweetalert2';
import { Deudores } from './deudores.model';
import { deuda } from '../modelos/deudas';
import { formatDate } from '@angular/common';
import { Router } from "@angular/router";
 

@Component({
  selector: 'app-ingresos-extraordinarios',
  templateUrl: './ingresos-extraordinarios.component.html',
  styleUrls: ['./ingresos-extraordinarios.component.css']
})
export class IngresosExtraordinariosComponent {
  tipo_formulario:string='extraordinario';
  personas: Personas[] = [];
  deudasDelUsuario : Deudores[]=[];
  deudasDelUsuarioExtra : Deudores[]=[];
  monto:number=0;
  recargo:number=0;
  total:number=0;
  fecha_corte:string='';
  fechaProximoPago:string='';
  diasAtraso:number=0;
  periodicidad:number=0;
  id_deuda:number=0;
  id_deudor:number=0;
  tipo_pago: string = "";

  montoExtra:number=0;
 
  
  fecha_corteExtra:string='';
  id_deudaExtra:number=0;
  id_deudorExtra:number=0;
  

constructor(private dataService:DataService,private deudaService:DeudaService,private personasService:PersonasService,public router: Router){}
ngOnInit(): void{
  this.consultarPersonas(this.dataService.obtener_usuario(3));
  console.log(this.personas);
}

consultarPersonas(idFraccionamiento: number): void {
  this.personasService.consultarPersonasPorFraccionamiento(idFraccionamiento).subscribe(
    (personas: Personas[]) => {
     this.personas = personas;
      console.log('Personas:', personas);
    },
    (error) => {
      // Manejo de errores
      console.error('Error:', error);
      Swal.fire({
        title: 'Error al consultar a las personas',
        text: 'Contacte con el administrador de la pagina',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  );
}

onChangeUsuario(event: any) {
  this.deudasDelUsuario = [];
  // Aquí puedes agregar la lógica que deseas ejecutar cuando cambia la opción seleccionada
  const valorSeleccionado = event.target.value;
  const destinatarioId = parseInt(valorSeleccionado.split(' - ')[0]);
  this.id_deudor=destinatarioId;
  this.personasService.consultarDeudoresExtraoridinarios(this.dataService.obtener_usuario(3),destinatarioId).subscribe(
    (deudasUsuario: Deudores[]) => {
     this.deudasDelUsuario = deudasUsuario
      console.log('deudas extraordinarias del usuario', deudasUsuario);
      if(this.deudasDelUsuario.length!=0){
        this.onChangeDeuda({ target: { selectedIndex: 0 } });
      }else{
        this.id_deuda=0;
        this.monto = 0;
        this.diasAtraso = 0;
        this.total =0;
        this.recargo=0;
        this.fechaProximoPago='';
        this.periodicidad=0;
        Swal.fire({
          title: 'El usuario seleccionado no tiene deudas extraordinarias vencidas',
          text: '',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
      }
     
    },
    (error) => {
      // Manejo de errores
      console.error('Error:', error);
    }
  );

  this.monto=0;
  this.periodicidad=0;
  this.fecha_corte='';

}

onChangeDeuda(event: any) {
  const selectedIndex = event.target.selectedIndex;
  const deudaSeleccionada = this.deudasDelUsuario[selectedIndex];
  this.id_deuda=deudaSeleccionada.id_deuda;

  this.monto = deudaSeleccionada.monto;
  this.fecha_corte = formatDate(deudaSeleccionada.proximo_pago, 'yyyy-MM-dd', 'en-US');
  this.periodicidad = deudaSeleccionada.periodicidad;
  this.recargo=deudaSeleccionada.recargo;

  // Calcular la fecha del próximo pago sumando la periodicidad a la fecha de vencimiento
  const proximoPago = new Date(deudaSeleccionada.proximo_pago); // Convertir a objeto Date
  proximoPago.setDate(proximoPago.getDate() + this.periodicidad); // Sumar la periodicidad en días

  // Formatear la fecha del próximo pago
  this.fechaProximoPago = formatDate(proximoPago, 'yyyy-MM-dd', 'en-US');

  const fechaActual = new Date(); // Fecha actual
  this.diasAtraso = Math.floor((fechaActual.getTime() - proximoPago.getTime()) / (1000 * 3600 * 24));

  // Verificar si los días de atraso son mayores que los días de gracia y agregar recargo

  this.total = deudaSeleccionada.monto

  if (this.diasAtraso > deudaSeleccionada.dias_gracia) {
    // Agregar el recargo al monto de la deuda
    
    this.total += deudaSeleccionada.recargo ; // Agregar el valor de lote al recargo
  
  }
 

}
onChangeOption(event:any){
  const selectedValue = event.target.value;

  if (selectedValue === 'ordinario') {
    this.router.navigate(['./PanelTesorero/IngresosOrdinarios']);
  } else if (selectedValue === 'extraordinario') {
   
  }
}

  

//Parte del pago de las deudas

pagarDeudaExtraordinaria(montoDeudaExtra: any) {
  const idDeudor = this.id_deudor // Reemplaza con el ID del deudor correspondiente
  const idDeuda = this.id_deuda; // Reemplaza con el ID de la deuda correspondiente
  const idFraccionamiento = this.dataService.obtener_usuario(3); // Reemplaza con el ID del fraccionamiento correspondiente
  const proximoPago = this.fechaProximoPago; // Reemplaza con la fecha deseada en el formato correcto
  
  const monto = this.monto

  console.log("monto: ", montoDeudaExtra, "total: ", monto)

  if(montoDeudaExtra<monto){
    this.tipo_pago = "abono";
   // montoDeudaExtra = monto - montoDeudaExtra;
  }
  else{
    this.tipo_pago = "liquidacion";
  }

  if(this.archivoSeleccionado){
    this.deudaService.pagarDeudaExtraordinaria(10,idDeudor, idDeuda, idFraccionamiento, proximoPago,this.archivoSeleccionado, this.tipo_pago, montoDeudaExtra, montoDeudaExtra).subscribe(
      (respuesta) => {
        if (respuesta) {
          Swal.fire({
            title: 'La deuda ha sido pagada exitosamente',
            text: '',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          console.log('La deuda ha sido pagada exitosamente');
          this.onChangeDeuda({ target: { selectedIndex: 0 } });
          this.onChangeUsuario({ target: { selectedIndex: 0 } });
          location.reload;
        } else {
          console.log('Hubo un problema al pagar la deuda');
          Swal.fire({
            title: 'Hubo un problema al pagar la deuda',
            text: '',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      (error) => {
        console.error('Error al intentar pagar la deuda:', error);
        Swal.fire({
          title: 'Hubo un problema al pagar la deuda',
          text: 'Por favor contactese con el administrador de la pagina',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }else{
    Swal.fire({
      title: 'Por favor cargue un comprobante de pago',
      text: '',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
}


imagenSeleccionada: any; // Variable para mostrar la imagen seleccionada en la interfaz
  archivoSeleccionado: File | null = null;
  imagenEnBytes: Uint8Array | null = null;
  

  handleInputFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagenSeleccionada = reader.result as string;
          this.archivoSeleccionado = file; // Guardar el archivo seleccionado
          Swal.fire({
            title: 'Comprobante cargado correctamente',
            text: '',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });

        };
        reader.readAsDataURL(file);
      }
    }
    input.value = ''; // Limpiar el input de tipo file
  }
}