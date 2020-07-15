// ==UserScript==
// @name            AtCoder Fav Rating
// @name:ja         AtCoder Fav Rating
// @namespace       https://github.com/Coki628/ac-fav-rating
// @version         1.1
// @description     You can check your fav's rating for AtCoder!
// @description:ja  AtCoderのお気に入り管理ページでレート等の情報を確認できます。
// @author          Coki628
// @match           https://atcoder.jp/settings/fav*
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @resource        CSS1 https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.12/css/dataTables.bootstrap.min.css
// @require         https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.12/js/jquery.dataTables.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.12/js/dataTables.bootstrap.min.js
// ==/UserScript==

GM_addStyle(GM_getResourceText('CSS1'));

(function() {
    'use strict';

    // 色のクラス名を取得
    let getColorType = function(x) {
        if (x >= 2800) {
            return 'user-red';
        } else if (2800 > x && x >= 2400) {
            return 'user-orange';
        } else if (2400 > x && x >= 2000) {
            return 'user-yellow';
        } else if (2000 > x && x >= 1600) {
            return 'user-blue';
        } else if (1600 > x && x >= 1200) {
            return 'user-cyan';
        } else if (1200 > x && x >= 800) {
            return 'user-green';
        } else if (800 > x && x >= 400) {
            return 'user-brown';
        } else {
            return 'user-gray';
        }
    }

    let getInfo = function(username, $tr) {
        $.ajax({
            // url: 'https://atcoder.jp/users/' + username + '/history/json',
            url: 'https://atcoder.jp/users/' + username,
            type: 'GET',
            // dataType: 'json',
            dataType: 'html',
        })
        .done(function(data) {
            // ユーザーページから必要な項目を取得
            let rows = $($($.parseHTML(data)).find('table.dl-table')[1]).find('tbody>tr');
            let rank = Number($(rows[0]).find('td').text().slice(0, -2));
            let rating = Number($(rows[1]).find('td>span').text());
            let highest = Number($($(rows[2]).find('td>span')[0]).text());
            let count = Number($(rows[3]).find('td').text());
            let lastCompeted = $(rows[4]).find('td').text();
            // 列追加
            $tr.prepend('<td></td>');
            $tr.append('<td>' + rank + '</td>');
            $tr.append('<td>' + rating + '</td>');
            $tr.append('<td>' + highest + '</td>');
            $tr.append('<td>' + count + '</td>');
            $tr.append('<td>' + lastCompeted + '</td>');

            if (rating >= 4000) {
                // tourist
                $tr.find('img').after('<img src="//img.atcoder.jp/assets/icon/crown4000.gif">')
            } else if (rating >= 3600) {
                // 金冠
                $tr.find('img').after('<img src="//img.atcoder.jp/assets/icon/crown3600.gif">')
            } else if (rating >= 3200) {
                // 銀冠
                $tr.find('img').after('<img src="//img.atcoder.jp/assets/icon/crown3200.gif">')
            }

            // 名前とレートに色付け
            let color = getColorType(rating);
            $($tr.find('td')[1]).find('a').removeClass('black').addClass(color);
            $($tr.find('td')[3]).addClass(color);
            color = getColorType(highest);
            $($tr.find('td')[4]).addClass(color);
        })
        .fail(function(data) {
            // 削除済ユーザー等への対応
            $tr.prepend('<td></td>');
            $tr.append('<td></td>');
            $tr.append('<td></td>');
            $tr.append('<td></td>');
            $tr.append('<td></td>');
            $tr.append('<td></td>');
        })
        .always(function(data) {
            total--;
            if (total === 0) {
                // 全部終わったらDataTablesを構築
                let dataTable = $table.DataTable({
                    paging: false,
                    lengthChange: false,
                    info: false,
                    // index列
                    columnDefs: [{
                        searchable: false,
                        orderable: false,
                        targets: 0,
                    }],
                    order: [[1, 'asc']],
                });
                // index列の制御
                dataTable.on('order.dt search.dt', function() {
                    dataTable.column(0, {search:'applied', order:'applied'}).nodes().each(function(cell, i) {
                        cell.innerHTML = i + 1;
                    });
                }).draw();
            }
        });
    }

    // テーブルサイズの調整
    $($('#vue-fav>div.row>div')[0]).removeClass('col-xs-6').addClass('col-xs-9');
    $($('#vue-fav>div.row>div')[1]).removeClass('col-xs-6').addClass('col-xs-3');

    let $table = $($('#vue-fav').find('table')[0]);
    // ヘッダ行の挿入
    $table.prepend('<thead><tr><th></th><th>Name</th><th>Rank</th><th>Rating</th><th>Highest Rating</th><th>Rated Matches</th><th>Last Competed</th>');
    // 表が見やすくなるスタイルを追加
    $table.addClass('table-striped table-hover table-bordered');

    // 各行を取得してユーザー情報を追加していく
    let rows = $table.find('tbody>tr');
    let total = rows.length;
    for (let i = 0; i < rows.length; i++) {
        let username = $(rows[i]).find('td>a').text();
        getInfo(username, $(rows[i]));
    }
})();
