import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { ShareComponent } from './share.component';
import { NotFoundComponent } from '../pages/miscellaneous/not-found/not-found.component';

const routes: Routes = [
	{
		path: '',
		component: ShareComponent,
		children: [
			{
				path: '',
				redirectTo: 'organization',
				pathMatch: 'full',
			},
			{
				path: 'organization/:link',
				loadChildren: () =>
					import('./organization/organization.module').then(
						(m) => m.OrganizationModule
					),
			},
			{
				path: 'employee/:id',
				loadChildren: () =>
					import(
						'./public-appointments/public-appointments.module'
					).then((m) => m.PublicAppointmentsModule),
			},
			{
				path: 'employee/:employeeid/create-appointment',
				loadChildren: () =>
					import(
						'./public-appointments/appointment-form/appointment-form.module'
					).then((m) => m.AppointmentFormModule),
			},
			{
				path: 'employee/:id/:eventId',
				loadChildren: () =>
					import(
						'./public-appointments/create-appointment/create-appointment.module'
					).then((m) => m.CreateAppointmentModule),
			},
			{
				path: '**',
				component: NotFoundComponent,
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ShareRoutingModule {}
