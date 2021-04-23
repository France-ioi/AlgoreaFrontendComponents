import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { DropdownOption } from 'src/app/modules/shared-components/components/dropdown/dropdown.component';
import { Item } from '../../http-services/get-item-by-id.service';

const INIT_MAX_RANGE_HOURS = 1;
const INIT_MAX_RANGE_MS = INIT_MAX_RANGE_HOURS * 3600 * 1000;

@Component({
  selector: 'alg-item-edit-advanced-parameters',
  templateUrl: './item-edit-advanced-parameters.component.html',
  styleUrls: [ './item-edit-advanced-parameters.component.scss' ]
})
export class ItemEditAdvancedParametersComponent implements OnInit {
  @Input() item?: Item;
  @Input() parentForm?: FormGroup;

  validationCritireaOptions: DropdownOption[] = [{
    label: $localize`Never`,
    value: 'None'
  }, {
    label: $localize`All children validated`,
    value: 'All'
  }, {
    label: $localize`All children but one validated`,
    value: 'AllButOne'
  }, {
    label: $localize`All 'Categories' children validated`,
    value: 'Categories'
  }, {
    label: $localize`One children validated`,
    value: 'One'
  }];

  fullScreenOptions: {label: string, value: string}[] = [{
    label: $localize`No`,
    value: 'forceNo'
  }, {
    label: $localize`Based on type`,
    value: 'default'
  }, {
    label: $localize`Yes mapped`,
    value: 'forceYes'
  }]

  minEnteringTimeMaxDate = new Date();

  constructor() { }

  ngOnInit(): void {
    this.handleDurationValidation();
  }

  onRequiresExplicitEntryChange(): void {
    this.handleDurationValidation();
  }

  onDurationEnabledChange(): void {
    this.handleDurationValidation();
  }

  handleDurationValidation(): void {
    const requiresExplicitEntryValue = this.parentForm?.get('requires_explicit_entry')?.value as boolean;
    const durationEnabledValue = this.parentForm?.get('duration_enabled')?.value as boolean;
    const enableValidation = requiresExplicitEntryValue && durationEnabledValue;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.parentForm?.get('duration')?.setValidators(enableValidation ? Validators.required : null);
    this.parentForm?.get('duration')?.updateValueAndValidity();
  }

  onEnteringTimeMaxEnabledChange(event: boolean): void {
    if (!event) {
      return;
    }

    const enteringTimeMin = this.parentForm?.get('entering_time_min')?.value as string;
    const enteringTimeMinDate = new Date(enteringTimeMin);
    this.parentForm?.get('entering_time_max')?.patchValue(
      new Date(enteringTimeMinDate.getTime() + INIT_MAX_RANGE_MS)
    );
  }

  onDateChange(): void {
    const enteringTimeMin = this.parentForm?.get('entering_time_min')?.value as Date;
    const enteringTimeMax = this.parentForm?.get('entering_time_max')?.value as Date;

    this.minEnteringTimeMaxDate = enteringTimeMin;

    if (enteringTimeMin.getTime() > enteringTimeMax.getTime()) {
      this.parentForm?.get('entering_time_max')?.patchValue(enteringTimeMin);
    }
  }

}
