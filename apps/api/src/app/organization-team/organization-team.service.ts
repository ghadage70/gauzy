import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CrudService } from '../core/crud/crud.service';
import {
	OrganizationTeamCreateInput as IOrganizationTeamCreateInput,
	OrganizationTeam as IOrganizationTeam
} from '@gauzy/models';
import { IPagination } from '../core';
import { Employee } from '../employee/employee.entity';
import { User } from '../user/user.entity';
import { OrganizationTeam } from './organization-team.entity';
import { OrganizationTeamEmployee } from '../organization-team-employee/organization-team-employee.entity';
import { Role } from '../role/role.entity';

@Injectable()
export class OrganizationTeamService extends CrudService<OrganizationTeam> {
	constructor(
		@InjectRepository(OrganizationTeam)
		private readonly organizationTeamRepository: Repository<
			OrganizationTeam
		>,
		@InjectRepository(Employee)
		private readonly employeeRepository: Repository<Employee>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>
	) {
		super(organizationTeamRepository);
	}

	async createOrgTeam(
		entity: IOrganizationTeamCreateInput
	): Promise<OrganizationTeam> {
		const organizationTeam = new OrganizationTeam();
		organizationTeam.name = entity.name;
		organizationTeam.organizationId = entity.organizationId;

		const members: string[] = [];

		entity.members.forEach((member) => {
			members.push(member.employeeId);
		});

		const employees = await this.employeeRepository.findByIds(members, {
			relations: ['user']
		});

		const managerRole = await this.roleRepository.findOne({
			where: { name: 'MANAGER' }
		});

		const teamEmployees: OrganizationTeamEmployee[] = [];
		employees.forEach((employee) => {
			const teamEmployee = new OrganizationTeamEmployee();
			teamEmployee.employeeId = employee.id;
			teamEmployee.employee = employee;

			const member = entity.members.find(
				(m) => m.employeeId === employee.id
			);
			if (member.roleId === managerRole.id) {
				teamEmployee.roleId = managerRole.id;
				teamEmployee.role = managerRole;
			}
			teamEmployees.push(teamEmployee);
		});
		organizationTeam.members = teamEmployees;

		return this.organizationTeamRepository.save(organizationTeam);
	}

	async updateOrgTeam(
		id: string,
		entity: IOrganizationTeamCreateInput
	): Promise<OrganizationTeam> {
		try {
			await this.organizationTeamRepository.delete(id);

			const organizationTeam = new OrganizationTeam();
			organizationTeam.name = entity.name;
			organizationTeam.organizationId = entity.organizationId;

			const members: string[] = [];

			entity.members.forEach((member) => {
				members.push(member.employeeId);
			});

			const employees = await this.employeeRepository.findByIds(members, {
				relations: ['user']
			});

			const managerRole = await this.roleRepository.findOne({
				where: { name: 'MANAGER' }
			});

			const teamEmployees: OrganizationTeamEmployee[] = [];
			employees.forEach((employee) => {
				const teamEmployee = new OrganizationTeamEmployee();
				teamEmployee.employeeId = employee.id;
				teamEmployee.employee = employee;

				const member = entity.members.find(
					(m) => m.employeeId === employee.id
				);
				if (member.roleId === managerRole.id) {
					teamEmployee.roleId = managerRole.id;
					teamEmployee.role = managerRole;
				}
				teamEmployees.push(teamEmployee);
			});
			organizationTeam.members = teamEmployees;

			return this.organizationTeamRepository.save(organizationTeam);
		} catch (err /*: WriteError*/) {
			throw new BadRequestException(err);
		}
	}

	async getAllOrgTeams(
		filter: FindManyOptions<OrganizationTeam>
	): Promise<IPagination<IOrganizationTeam>> {
		const total = await this.organizationTeamRepository.count(filter);

		const items = await this.organizationTeamRepository.find(filter);

		for (const orgTeams of items) {
			for (const teamEmp of orgTeams.members) {
				const emp = await this.employeeRepository.findOne(
					teamEmp.employeeId
				);
				emp.user = await this.userRepository.findOne(emp.userId);
				teamEmp.employee = emp;
			}
		}

		return { items, total };
	}
}
