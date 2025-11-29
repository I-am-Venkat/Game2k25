frappe.ui.form.on("Game", {
    refresh(frm) {

        if (!frm.is_new()) {

            frm.add_custom_button("Add Winners", function () {

                // Fetch participants list from child table
                let participants = (frm.doc.participants || []).map(p => p.participants);

                if (!participants.length) {
                    frappe.msgprint("No participants found for this game.");
                    return;
                }

                let d = new frappe.ui.Dialog({
                    title: "Add Winners",
                    fields: [
                        {
                            label: "Game",
                            fieldname: "game",
                            fieldtype: "Link",
                            options: "Game",
                            default: frm.doc.name,
                            read_only: 1
                        },
                        {
                            label: "1st Prize",
                            fieldname: "first",
                            fieldtype: "Select",
                            options: participants.join("\n"),
                            reqd: 1
                        },
                        {
                            label: "2nd Prize",
                            fieldname: "second",
                            fieldtype: "Select",
                            options: participants.join("\n")
                        },
                        {
                            label: "3rd Prize",
                            fieldname: "third",
                            fieldtype: "Select",
                            options: participants.join("\n")
                        }
                    ],
                    primary_action_label: "Save Winners",

                    primary_action(values) {

    frappe.call({
        method: "frappe.client.insert",
        args: {
            doc: {
                doctype: "Winners",
                game: frm.doc.name,
                first: values.first,
                second: values.second,
                third: values.third
            }
        },
        callback: function(r) {
            if (!r.exc) {

                // Update game status
                frm.set_value("status", "Finished");

                frm.save().then(() => {
                    frappe.msgprint("Winners Added Successfully!");
                });

                d.hide();
            }
        }
    });
}

                });

                // ========== Dynamic Dropdown Filtering ==========
                function update_dropdowns() {
                    let first = d.get_value("first");
                    let second = d.get_value("second");

                    // Filter 2nd prize dropdown
                    let second_list = participants.filter(p => p !== first);
                    d.set_df_property("second", "options", second_list.join("\n"));

                    // Filter 3rd prize dropdown
                    let third_list = participants.filter(p => p !== first && p !== second);
                    d.set_df_property("third", "options", third_list.join("\n"));
                }

                d.fields_dict.first.$input.on("change", update_dropdowns);
                d.fields_dict.second.$input.on("change", update_dropdowns);
                // =================================================

                d.show();
            });
        }
    }
});
