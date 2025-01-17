import NcBrowserComponent from './NcBrowser.vue';

export default class Browser {
	constructor({
		wrapper,
		method,
		on_success,
		doctype,
		docname,
		fieldname,
		files,
		folder,
		disable_file_browser,
		frm
	} = {}) {

		if (!wrapper) {
			this.make_dialog();
		} else {
			this.wrapper = wrapper.get ? wrapper.get(0) : wrapper;
		}

		this.$ncbrowser = new Vue({
			el: this.wrapper,
			render: h => h(NcBrowserComponent, {
				props: {
					show_upload_button: !Boolean(this.dialog),
					doctype,
					docname,
					fieldname,
					method,
					folder,
					on_success,
					disable_file_browser
				}
			})
		});

		this.browser = this.$ncbrowser.$children[0];

		this.browser.$watch('close_dialog', (close_dialog) => {
			if (close_dialog) {
				this.dialog && this.dialog.hide();
			}
		});

  }
  
	select_folder() {
		this.dialog && this.dialog.get_primary_btn().prop('disabled', true);
		return this.browser.select_folder();
	}

	make_dialog() {
		this.dialog = new frappe.ui.Dialog({
			title: __('Select NextCloud Destination Folder'),
      size: 'large',
      primary_action_label: __('Select'),
			primary_action: () => {
        let nc_folder = this.select_folder();
        let dtdn = this.wrapper.ownerDocument.body.getAttribute('data-route').replace('Form/', '');
        let pos = dtdn.lastIndexOf('/');
        let docname = dtdn.substr(pos+1);
        let doctype = dtdn.replace('/'+docname,'')
        if (nc_folder.is_folder) {
          frappe.db.set_value(doctype, docname, 'nc_folder', nc_folder.path);          
        } else {
          frappe.db.set_value(doctype, docname, 'nc_folder', '');
          frappe.msgprint(__('You have selected a file and not a folder'), nc_folder.file_name);
        }
        this.dialog.hide();
        window.location.reload();
      }  
		});

		this.wrapper = this.dialog.body;
		this.dialog.show();
		this.dialog.$wrapper.on('hidden.bs.modal', function() {
			$(this).data('bs.modal', null);
			$(this).remove();
		});
	}
}
