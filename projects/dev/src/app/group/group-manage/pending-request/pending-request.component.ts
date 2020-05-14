import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { GroupService } from "../../../shared/services/api/group.service";
import { PendingRequest } from "../../../shared/models/pending-request.model";
import { SortEvent } from "primeng/api/sortevent";
import { MessageService } from "primeng/api";
import {
  ERROR_MESSAGE,
  PENDING_REQUEST_SUCCESS_MESSAGE,
} from "../../../shared/constants/api";

@Component({
  selector: "app-pending-request",
  templateUrl: "./pending-request.component.html",
  styleUrls: ["./pending-request.component.scss"],
  providers: [MessageService],
})
export class PendingRequestComponent implements OnInit, OnChanges {
  @Input() id;

  columns = [
    { field: "member_id", header: "ID" },
    { field: "joining_user.login", header: "LOGIN" },
    { field: "at", header: "REQUESTED ON" },
  ];
  requests = [];
  panel = [];
  multiSortMeta = [
    { field: "at", order: -1 },
    { field: "member_id", order: 1 },
  ];
  prevSortMeta = "-at member_id";

  acceptLoading = false;
  rejectLoading = false;
  selection = [];

  _setRequestData(reqs: PendingRequest[]) {
    this.requests = [];
    this.selection = [];

    this.requests = reqs.map(req => {
      const joining_user = req.joining_user;
      let login;

      if (!joining_user.first_name && !joining_user.last_name) {
        login = `${joining_user.login || ""}`;
      } else {
        login = `${joining_user.first_name || ""} ${joining_user.last_name || ""} (${joining_user.login || ""})`;
      }

      return {
        member_id: req.member_id,
        "joining_user.login": login,
        grade: joining_user.grade,
        joining_user: joining_user,
        at: req.at,
      };
    });
  }

  _manageRequestData(res, summary, msg) {
    if (res["success"] === true && res["message"] === "updated") {
      const status = res["data"];
      let succ = 0,
        fail = 0;

      for (const group_id in status) {
        switch (status[group_id]) {
          case "success":
          case "unchanged":
            succ++;
            break;
          default:
            fail++;
        }
      }

      if (fail === 0) {
        this.messageService.add({
          severity: "success",
          summary: summary,
          detail: `${succ} request(s) have been ${msg}`,
          life: 5000,
        });
      } else if (succ === 0) {
        this.messageService.add({
          severity: "error",
          summary: summary,
          detail: `Unable to ${summary} the selected request(s).`,
          life: 5000,
        });
      } else {
        this.messageService.add({
          severity: "warn",
          summary: summary,
          detail: `${succ} request(s) have been ${msg}, ${fail} could not be executed`,
          life: 5000,
        });
      }

      this.groupService
        .getManagedRequests(this.id)
        .subscribe((reqs: PendingRequest[]) => {
          this._setRequestData(reqs);
        });
    }
  }

  _processRequestError(err, summary) {
    this.messageService.add({
      severity: "error",
      summary: summary,
      detail: ERROR_MESSAGE.fail,
      life: 5000,
    });
  }

  constructor(
    private groupService: GroupService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.panel.push({
      name: "Pending Requests",
      columns: this.columns,
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.groupService
      .getManagedRequests(changes.id.currentValue)
      .subscribe((reqs: PendingRequest[]) => {
        this._setRequestData(reqs);
      });
  }

  onExpandWidth(e) {}

  onClickAccept(e) {
    if (
      this.selection.length === 0 ||
      this.acceptLoading ||
      this.rejectLoading
    ) {
      return;
    }

    this.acceptLoading = true;
    this.groupService
      .acceptJoinRequest(
        this.id,
        this.selection.map((val) => val.joining_user.group_id)
      )
      .subscribe(
        (res) => {
          this._manageRequestData(res, "accept", "accepted");
          this.acceptLoading = false;
        },
        (err) => {
          this._processRequestError(err, "accept");
          this.acceptLoading = false;
        }
      );
  }

  onClickReject(e) {
    if (
      this.selection.length === 0 ||
      this.acceptLoading ||
      this.rejectLoading
    ) {
      return;
    }

    this.rejectLoading = true;
    this.groupService
      .rejectJoinRequest(
        this.id,
        this.selection.map((val) => val.joining_user.group_id)
      )
      .subscribe(
        (res) => {
          this._manageRequestData(res, "reject", "declined");
          this.rejectLoading = false;
        },
        (err) => {
          this._processRequestError(err, "reject");
          this.rejectLoading = false;
        }
      );
  }

  onSelectAll(event) {
    if (this.selection.length === this.requests.length) {
      this.selection = [];
    } else {
      this.selection = this.requests;
    }
  }

  onHeaderCheckboxToggle(event) {
    if (event.checked) {
      this.selection = this.requests;
    } else {
      this.selection = [];
    }
  }

  onCustomSort(event: SortEvent) {
    let diff = false;

    const sortBy = event.multiSortMeta.map((meta) =>
      meta.order === -1 ? `-${meta.field}` : meta.field
    );

    if (sortBy.sort().join(" ") !== this.prevSortMeta) {
      diff = true;
    }

    if (!diff) {
      return;
    }

    this.prevSortMeta = sortBy.sort().join(" ");
    this.groupService
      .getManagedRequests(this.id, sortBy)
      .subscribe((reqs: PendingRequest[]) => {
        this._setRequestData(reqs);
      });
  }
}
